# gpt-oss-20b - Free

import requests
import json
import time
t = time.time()
apikey = "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"
response = requests.post(
  url="https://openrouter.ai/api/v1/chat/completions",
  headers={
    "Authorization": f"Bearer {apikey}",
    "Content-Type": "application/json",
  },
  data=json.dumps({
    "model": "openai/gpt-oss-20b:free",
    "messages": [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ],
    
  })
)
content = response.json()["choices"][0]["message"]["content"]
s = time.time()
print(f"{content}\nTime = {s-t:.4f} seconds")