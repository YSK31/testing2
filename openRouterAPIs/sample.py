import time
from datetime import datetime

# Check when you can make requests again
reset_timestamp = 1755648000000 / 1000
current_time = time.time()
wait_seconds = reset_timestamp - current_time

print(f"You can make requests again in: {wait_seconds/3600:.1f} hours")
print(f"At: {datetime.fromtimestamp(reset_timestamp)}")