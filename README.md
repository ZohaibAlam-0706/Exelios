<h1 style="font-size: 40px;">EXELIOS</h1>

An Exchange project 

<h1 style="font-size: 30px; color: red">Architecture</h1>
![My Image](https://raw.githubusercontent.com/ZohaibAlam-0706/Exelios/refs/heads/main/frontend/public/Exelios_Architecture.png)

## Running locally

> [!Note]
> This uses npm as package manager 
> You Should have docker-compose installed and online in your system

1. Clone the repository:

```bash
git clone https://github.com/ZohaibAlam-0706/Exelios.git
```

2. Navigate to the project directory:

```bash
cd Exelios
```

3. Running the frontend first

```bash
cd frontend && npm install
npm run dev
```


4. Running the backend

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

##Usage

Access the Application in your browser
```bash
http://localhost:3000
```
