# simple-todo-redis

## Setup
1. npm install
2. copy .env.example -> .env and fill REDIS_URL
3. npm start

## CURL (Windows CMD)
# CREATE
curl -X POST http://localhost:3000/todos ^
 -H "Content-Type: application/json" ^
 -d "{\"title\":\"Buy milk\"}"

# READ
curl http://localhost:3000/todos

# UPDATE (toggle)
curl -X PUT http://localhost:3000/todos/1

# UPDATE (set fields)
curl -X PUT http://localhost:3000/todos/1 ^
 -H "Content-Type: application/json" ^
 -d "{\"title\":\"Buy eggs\",\"completed\":true}"

# DELETE
curl -X DELETE http://localhost:3000/todos/1
