import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum

class BundlePriority(str, Enum):
    EXPEDITED = "EXPEDITED"  # Red - high priority
    NORMAL = "NORMAL"        # Cyan - standard
    BULK = "BULK"            # Gray - low priority

class BundleStatus(str, Enum):
    QUEUED = "QUEUED"
    TRANSMITTING = "TRANSMITTING"
    DELIVERED = "DELIVERED"
    FORWARDED = "FORWARDED"
    EXPIRED = "EXPIRED"

@dataclass
class DTNBundle:
    bundle_id: str
    source_station: str
    destination_station: str  # "ISS" or station name
    payload: str
    priority: BundlePriority
    created_at: datetime
    ttl_hours: int = 24
    status: BundleStatus = BundleStatus.QUEUED
    current_custodian: str = ""
    forwarded_to: Optional[str] = None
    delivered_at: Optional[datetime] = None
    hops: List[str] = field(default_factory=list)
    
    def is_expired(self) -> bool:
        """Check if bundle has exceeded TTL"""
        age = datetime.now(timezone.utc) - self.created_at
        return age > timedelta(hours=self.ttl_hours)
    
    def to_dict(self) -> Dict:
        return {
            "bundle_id": self.bundle_id,
            "bundle_id_short": self.bundle_id[:8],
            "source_station": self.source_station,
            "destination_station": self.destination_station,
            "payload": self.payload,
            "priority": self.priority.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "ttl_hours": self.ttl_hours,
            "current_custodian": self.current_custodian,
            "forwarded_to": self.forwarded_to,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
            "hops": self.hops,
            "age_seconds": (datetime.now(timezone.utc) - self.created_at).total_seconds()
        }

class DTNBundleManager:
    """Manages DTN bundles across ground station network"""
    
    def __init__(self, stations: List[Dict]):
        self.stations = {s["id"]: s["name"] for s in stations}
        self.bundles: Dict[str, DTNBundle] = {}
        self.station_queues: Dict[str, List[str]] = {sid: [] for sid in self.stations.keys()}
        
        print(f"📦 DTN Bundle Manager initialized with {len(self.stations)} stations")
    
    def create_bundle(self, source_station: str, destination: str, 
                     payload: str, priority: str = "NORMAL", ttl_hours: int = 24) -> DTNBundle:
        """Create a new DTN bundle"""
        bundle_id = str(uuid.uuid4())
        
        priority_enum = BundlePriority.NORMAL
        if priority.upper() == "EXPEDITED":
            priority_enum = BundlePriority.EXPEDITED
        elif priority.upper() == "BULK":
            priority_enum = BundlePriority.BULK
        
        bundle = DTNBundle(
            bundle_id=bundle_id,
            source_station=source_station,
            destination_station=destination,
            payload=payload,
            priority=priority_enum,
            created_at=datetime.now(timezone.utc),
            ttl_hours=ttl_hours,
            current_custodian=source_station,
            hops=[source_station]
        )
        
        self.bundles[bundle_id] = bundle
        self.station_queues[source_station].append(bundle_id)
        
        print(f"📦 Created bundle {bundle_id[:8]} at {source_station}: {payload[:30]}...")
        return bundle
    
    def transmit_bundle(self, bundle_id: str, from_station: str, to_station: str) -> bool:
        """Transmit bundle from one station to another (or ISS)"""
        if bundle_id not in self.bundles:
            return False
        
        bundle = self.bundles[bundle_id]
        
        # NEW: Prevent forwarding loops - don't send to stations we've already visited
        if to_station in bundle.hops:
            print(f"⚠️  Bundle {bundle_id[:8]} loop detected! Not forwarding {from_station} → {to_station}")
            return False
        
        # Mark as transmitting
        bundle.status = BundleStatus.TRANSMITTING
        
        # Simulate transmission delay
        if to_station == "ISS" or to_station == bundle.destination_station:
            # Delivered!
            bundle.status = BundleStatus.DELIVERED
            bundle.delivered_at = datetime.now(timezone.utc)
            bundle.hops.append(to_station)
            
            # Remove from queue
            if bundle_id in self.station_queues[from_station]:
                self.station_queues[from_station].remove(bundle_id)
            
            print(f"✅ Bundle {bundle_id[:8]} delivered to {to_station}")
            return True
        else:
            # Forwarded to another station
            bundle.status = BundleStatus.FORWARDED
            bundle.current_custodian = to_station
            bundle.forwarded_to = to_station
            bundle.hops.append(to_station)
            
            # Move from source queue to destination queue
            if bundle_id in self.station_queues[from_station]:
                self.station_queues[from_station].remove(bundle_id)
            self.station_queues[to_station].append(bundle_id)
            
            # Reset status to queued at new station
            bundle.status = BundleStatus.QUEUED
            
            print(f"📨 Bundle {bundle_id[:8]} forwarded {from_station} → {to_station}")
            return True
    
    def get_station_queue(self, station_id: str) -> List[Dict]:
        """Get all bundles in a station's queue"""
        bundle_ids = self.station_queues.get(station_id, [])
        bundles = []
        
        for bid in bundle_ids:
            if bid in self.bundles:
                bundle = self.bundles[bid]
                if not bundle.is_expired():
                    bundles.append(bundle.to_dict())
                else:
                    # Mark as expired
                    bundle.status = BundleStatus.EXPIRED
        
        # Sort by priority (expedited first)
        priority_order = {"EXPEDITED": 0, "NORMAL": 1, "BULK": 2}
        bundles.sort(key=lambda b: priority_order.get(b["priority"], 99))
        
        return bundles
    
    def get_all_queues(self) -> Dict[str, List[Dict]]:
        """Get queues for all stations"""
        return {
            station_id: self.get_station_queue(station_id)
            for station_id in self.stations.keys()
        }
    
    def process_contact(self, station_id: str, is_visible: bool, next_visible_station: Optional[str] = None):
        """
        Process bundles during contact opportunities
        - If ISS visible: transmit queued bundles
        - If not visible but another station will be: forward bundles
        """
        queue = self.station_queues.get(station_id, [])
        
        if not queue:
            return
        
        if is_visible:
            # ISS is overhead - transmit bundles
            transmitted = []
            for bundle_id in queue[:3]:  # Transmit up to 3 bundles per update
                if self.transmit_bundle(bundle_id, station_id, "ISS"):
                    transmitted.append(bundle_id)
            
            if transmitted:
                print(f"📡 {station_id} transmitted {len(transmitted)} bundles to ISS")
        
        elif next_visible_station and len(queue) > 0:
            # Forward bundle to next station that will have contact
            # Forward highest priority bundle
            bundle_id = queue[0]
            self.transmit_bundle(bundle_id, station_id, next_visible_station)
    
    def cleanup_expired(self):
        """Remove expired bundles from all queues"""
        for bundle_id, bundle in list(self.bundles.items()):
            if bundle.is_expired() and bundle.status != BundleStatus.DELIVERED:
                bundle.status = BundleStatus.EXPIRED
                # Remove from station queue
                for queue in self.station_queues.values():
                    if bundle_id in queue:
                        queue.remove(bundle_id)
                print(f"⏰ Bundle {bundle_id[:8]} expired (TTL exceeded)")