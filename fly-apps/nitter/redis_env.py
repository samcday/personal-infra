#!/usr/bin/env python3

import os
from urllib.parse import urlparse

uri = os.environ['FLY_REDIS_CACHE_URL']
result = urlparse(uri)
print('REDIS_HOST={}'.format(result.hostname))
print('REDIS_PORT={}'.format(result.port))
print('REDIS_AUTH={}'.format(result.password))
