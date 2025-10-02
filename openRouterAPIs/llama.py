# llama-3.3-70b-instruct - Free
import time
import requests
import json

apikey = "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"
def llama(prompt):
    response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {apikey}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "meta-llama/llama-3.3-70b-instruct:free",
        "messages": [
        {
            "role": "user",
            "content": f"{prompt} | I want only git command, no explanations, nothing"
        }
        ],
    })
    )
    return response

for prompt in ["create a new branch called feature-login", "push to main", "push file.txt to dev", "create a new branch bugfix-123", "push to feature-x branch", "push data.csv to main", "create a new branch hotfix", "push image.png to staging", "push to master", "create a new branch release-v2", "push script.js to main", "push to production branch", "create a new branch experimental", "push index.html to dev", "push to test-branch"]:
    response =llama(prompt)
    print(response.json())
    time.sleep(5)