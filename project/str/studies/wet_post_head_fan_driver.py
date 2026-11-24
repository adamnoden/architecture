"""Thin JSON adapter after validated native-floor and cage computation.

The caller owns current native source/request admission. Regenerated paths
bind the supplied cage to its saved settings without another solve or collision run.
"""
import json
import sys
from wet_post_head_fan import cage_geometry_digest, recover_wet_head_fans
from wet_support_cage_comparison import build_paths, validate_settings

def recover_request(payload):
    if set(payload)!={'schema','native','cage','binding'} or payload['schema']!='str-wet-head-fan-request/1':
        raise ValueError('Explicit native, actual generated cage and caller binding required')
    settings=validate_settings(payload['cage']['settings'])
    main,links=build_paths(payload['native']['seatedWetSupport'],settings)
    binding={**payload['binding'],'cageGeometrySHA256':cage_geometry_digest({'settings':settings,'mainBars':main,'links':links})}
    return {'schema':'str-wet-head-fan-response/1','result':recover_wet_head_fans(payload['native'],payload['cage'],binding)}


if __name__=='__main__':json.dump(recover_request(json.load(sys.stdin)),sys.stdout,allow_nan=False)
