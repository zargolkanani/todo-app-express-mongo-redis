# compare-performance

## Setup
1. npm install
2. copy .env.example -> .env and fill REDIS_URL and MONGO_URL
3. Run tests:

# Redis test
node redis_test.js

# Mongo test
node mongo_test.js

## Example output (sample)
Redis Insert Time: 50 ms
Redis Read Time: 10 ms

MongoDB Insert Time: 400 ms
MongoDB Read Time: 200 ms
