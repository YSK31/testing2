# mistral-7b-instruct - Free

import requests
import json

apikey = "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"
response = requests.post(
  url="https://openrouter.ai/api/v1/chat/completions",
  headers={
    "Authorization": f"Bearer {apikey}",
    "Content-Type": "application/json",
  },
  data=json.dumps({
    "model": "mistralai/mistral-7b-instruct:free",
    "messages": [
      {
        "role": "user",
        "content": "I want you to only provide the command of git which pushes to repo named 'my-repo' of two files (file.txt, sample.py), i want only command, no explanations, nothing"
      }
    ],
  })
)
content = response.json()["choices"][0]["message"]["content"]
print(content)