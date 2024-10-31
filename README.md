<h1 style="font-size: 40px;">EXELIOS</h1>

An Exchange project 

## Running locally

> [!Note]
> This uses npm as package manager 

1. Clone the repository:

```bash
git clone https://github.com/ZohaibAlam-0706/Exelios.git
```

2. Navigate to the project directory:

```bash
cd Exelios
```
#Instant Docker Setup
> [!Note]
> Your Docker Deamon Should be Online

# Traditional Docker Setup

(Optional) Start a PostgreSQL database using Docker:

```bash
docker run -d \

--name exelios-db \

-e POSTGRES_USER=myuser  \

-e POSTGRES_PASSWORD=mypassword \

-e  POSTGRES_DB=mydatabase  \

-p 5432:5432 \

postgres
```

1. Create a .env file:
    - Copy `.env.example` and rename it to `.env`.

2. Run the Docker Command to start the Project Locally:
```bash
docker run `putCommand` -p 3000:3000 -p 5000:5000
```

##Usage

Access the Application in your browser
```bash
http://localhost:3000
```
