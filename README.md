<h1 align="center" style="font-size: 40px;">EXELIOS</h1>

<h3 align="center"> An Exchange project with a scalable architecture </h3>

<h1 style="font-size: 30px; color: red">Architecture</h1>

![Exelios-Architecure](https://github.com/user-attachments/assets/6f5ed6a5-255d-4454-95b8-901fb5d532c1)


# Table of Contents

- [Table of contents:](#table-of-contents)
  - [Why this Architecture?](#why-this-architecture)
  - [Running Locally using Docker](#running-locally-using-docker)
    - [Pull the code](#pull-the-code)
    - [Navigate to the project directory](#navigate-to-the-project-directory)
  - [Running the code locally using npm and docker-compose](#running-the-code-locally-using-npm-and-docker-compose)
    - [Clone the repository](#clone-the-repository)
    - [Temporary preliminary steps](#temporary-preliminary-steps)
  - [Usage](#usage)
  - [Techstack](#techstack)
    - [Frontend](#frontend)
    - [Backend](#backend)

## Why this Architecture?

- This is the most optimal way to implement an exchange because latency matters the most in an exchange
- We cannot do CRUD operations directly for any order to a database as it increases latency. So we do it via process memory.
- We cannot directly put crutial data of orders and user's money in just a server because servers are prone to crashes. Instead, we send request to process through a queue to an Engine which processes all the orders.
- After processing an order, the Engine publishes the result to two PubSubs. First one sends the result back to the api server to send the user the result of their order. The later one sends the result to websockets with which many users are connected and get the updated orderbook in realtime.
- Also the Engine pushes the results in a queue for a db processor service to perform the task of database calls to save the data.
- From time to time we also take snapshots of the engine states to ensure that if the engine goes down we can still re-create the same state as before. 

## Running locally using Docker

> [!Note]
> You should have docker and docker-compose installed in your system

### Pull the code
```bash
git clone https://github.com/ZohaibAlam-0706/Exelios.git    
```

### Navigate to the project directory

```bash
cd Exelio
```

### Run the Docker command to start the project locally

```bash
docker-compose up --build
```

## Running the code locally using npm and docker-compose

> [!Note]
> This uses npm as package manager 
> You Should have docker-compose installed and online in your system

### Clone the repository

```bash
git clone https://github.com/ZohaibAlam-0706/Exelios.git    
```

### Temporary preliminary steps

1. Navigate to the project directory:

```bash
cd Exelios
```

2. Running the frontend first

```bash
cd frontend && npm install
npm run dev
```


3. Running the backend

> [!Note]
> Backend contains several services. So will have to run them seperately in each terminal
    
In another terminal navigate to the backend directory

```bash
cd backend  
``` 

Now run each service separately

In 2nd terminal run:
   
```bash
cd docker 
docker-compose up
```
This will start Database and redis locally for you

In 3rd terminal run:
   
```bash
cd api 
npm install
npm run dev
```


In 4th terminal run:
   
```bash
cd db
npm install
npm run seed:db
npm run dev
```

In 5th terminal run:
 
```bash
cd engine
npm install
npm run dev
```

In 6th terminal run:

```bash
cd ws
npm install
npm run dev
```

In 7th terminal run:

```bash
cd marketMaker
npm install
npm run dev
```

## Usage

Access the Application in your browser

```bash
http://localhost:3000
```
## TechStack
- This whole project is written in typescript

### Frontend
- NextJs with npm as the package manager

### Backend
- Express library
- pg library
- timescaledb as database
- ws library for websocket
- Redis for Queues ans PubSubs
