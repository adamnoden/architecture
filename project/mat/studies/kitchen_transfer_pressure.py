"""Reduced 14-node closed-door kitchen network. Flow in L/s; area in mm²; pressure in Pa."""
def dp(q,area):
    return .6*q*abs(q)/(.61*area/1000)**2
def room_supply(node_p,wet):
    # Each bedroom supply q crosses the exterior inlet, then its remaining q-wet
    # crosses the room door. The monotone pressure drop also allows reversed transfer.
    lo,hi=0.,50.
    for _ in range(34):
        q=(lo+hi)/2
        if dp(q,15000)+dp(q-wet,7600)<-node_p:lo=q
        else:hi=q
    return (lo+hi)/2
def standby(mask,makeup,kitchen_duty=None):
    guest,utility,kitchen_fan,rear,family,principal=[13+3*((mask>>i)&1) for i in range(6)]
    if kitchen_duty is not None:
        kitchen_fan=kitchen_duty
    exhaust=guest+utility+kitchen_fan+rear+family+principal
    lo,hi=-30.,-.001
    for _ in range(38):
        ring=(lo+hi)/2
        bedrooms=[room_supply(ring,k) for k in (0,0,rear,principal)]
        hall=ring-dp(sum(bedrooms)-rear-family-principal,90000)
        ground=room_supply(hall,0)
        residual=sum(bedrooms)+2*ground+makeup-exhaust
        if residual>0:lo=ring
        else:hi=ring
    assert abs(residual)<1.e-6
    return {'kitchenPa':hall-dp(kitchen_fan-makeup,7600),'sixRoomInletLps':bedrooms+[ground]*2}
