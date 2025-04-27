# Multi-Container Docker Deployment with Elastic Beanstalk

# Project Scope

This application integrates multiple services: a **React frontend**, a **Node.js backend**, a **Redis message broker**, and a **PostgreSQL database**. The following describes the system components and their interaction:

## Service Overview

- **Frontend (React - client)**:  
  The React application serves as the user interface, collecting input from users and sending requests to the backend server. The frontend interacts with the backend via HTTP requests.

- **Backend (Node.js - server)**:  
  The Node.js server handles HTTP requests from the frontend. It performs business logic, processes user input, publishes tasks to the **Redis message queue**, and stores the user input in the **PostgreSQL database**.

- **Worker Service**:  
  The worker service subscribes to Redis channel for `insert` event. When `insert` event is published to the Redis channel, the worker retrieves it, performs the required computation (e.g., calculates Fibonacci numbers), and stores the result in **Redis** as a key-value pair. The **PostgreSQL database** only stores the user input (the number), while Redis stores both the user input and the computed result.

- **Nginx Reverse Proxy**:  
  Nginx serves as a reverse proxy that routes traffic to either the frontend (React) or the backend (Node.js) based on the URL. It ensures traffic distribution.

- **Redis (Pub/Sub)**:  
  Redis is used as a message broker between the backend and the worker service. The backend publishes `insert` event (e.g., Fibonacci calculation) to Redis channel. The worker subscribes for `insert` event and performs computations. Redis also stores the key-value pairs for user input numbers and computed Fibonacci results.

- **PostgreSQL Database**:  
  The database stores the user input (number) for persistence. Only the user input is saved in the database, while Redis holds both the input and the computed Fibonacci results for real-time access.

## Detailed Workflow

1. **User Interaction**:  
   A user inputs a number in the **React frontend** (client), which sends a request to the **Node.js backend** to calculate the Fibonacci number for the given input.

2. **Backend Processing**:

   - The backend (Node.js) stores the user input in the **PostgreSQL database** for persistence.
   - The backend then publishes the input (number) to a Redis channel using the Redis publisher. This action notifies the worker service to process the task.

3. **Task Processing by Worker**:

   - The **worker service** subscribes to the Redis channel.
   - When the worker service receives `insert` event (user input), it computes the Fibonacci result asynchronously.
   - The Fibonacci result is saved in **Redis** as a key-value pair, where the key is the user input (number) and the value is the calculated Fibonacci result.
   - The **PostgreSQL database** only stores the user input (the number), without the computed result.

4. **Real-time Data Access**:
   - Users can query all stored input values from the **PostgreSQL database** via the backend (accessible through the `/values/all` route).
   - For real-time updates, users can query Redis to get the current Fibonacci results, as stored in Redis under the `/values/current` route.

## Technical Stack

- **Frontend**: React (client-side)
- **Backend**: Node.js (server-side), Express
- **Worker**: Node.js (worker), Redis Pub/Sub for event messaging
- **Database**: PostgreSQL (for data persistence)
- **Message Broker**: Redis (used for pub/sub and caching)
- **Reverse Proxy**: Nginx (routes traffic to the correct service)
- **Deployment**: AWS Elastic Beanstalk for deployment of Docker containers

## Key Components

- **Docker**:  
  All services (frontend, backend, worker, Nginx) are containerized using Docker. This ensures that each service runs in its own isolated environment, making the application scalable and easy to manage.

- **Docker Compose**:  
  Docker Compose is used to define and manage the multi-container environment for development and deployment. It ensures that the services can interact seamlessly with one another.

- **Elastic Beanstalk**:  
  AWS Elastic Beanstalk is used to deploy the multi-container Docker application. It automates the deployment process, including scaling, load balancing, and monitoring of the application.

This project deploys a multi-container Docker application to AWS Elastic Beanstalk using GitHub Actions. Each service runs inside its own **Docker container**.

## Deployment Workflow

1. **Push Docker Images to Docker Hub**:  
   Docker images are built for each service (client, server, worker, Nginx) and pushed to Docker Hub.

2. **Prepare Docker Environment**:  
   Docker Compose is used to define and configure the multi-container environment.

3. **Deploy with AWS Elastic Beanstalk**:  
   The application is deployed to AWS Elastic Beanstalk using Docker. Elastic Beanstalk manages the infrastructure, scaling, and networking.

4. **Monitor & Scale**:  
   Elastic Beanstalk automatically scales the application based on demand and ensures the proper routing of requests to services.

---

# ⚙️ How It Works (Step-by-Step)

1. Push code to GitHub `main` branch.
2. GitHub Actions automatically:
   - Builds images for client, server, worker, nginx.
   - Pushes images to Docker Hub.
   - Creates `deploy.zip` (zipping **all project files [excluding `.git`]**).
   - Deploys `deploy.zip` to Elastic Beanstalk.
3. Elastic Beanstalk:
   - Reads `docker-compose.yml`.
   - Pulls images from Docker Hub.
   - Runs the app.

---

# 🔑 GitHub Secrets (required)

In your GitHub repository, go to **Settings > Secrets and variables > Actions**, add these secrets:

| Secret Name           | Description                    |
| :-------------------- | :----------------------------- |
| DOCKER_USERNAME       | Your Docker Hub username       |
| DOCKER_PASSWORD       | Your Docker Hub password       |
| AWS_ACCESS_KEY        | AWS IAM user access key        |
| AWS_SECRET_ACCESS_KEY | AWS IAM user secret access key |

---

## 📂 Project Structure

- `/client` --> React frontend
- `/server` --> Node.js backend
- `/worker` --> Worker service
- `/nginx` --> Nginx reverse proxy
- `docker-compose.yml` --> Tells AWS how to run everything together

---

# ❗ Important Notes

✅ You must zip **everything** (all folders and files: `client/`, `server/`, `worker/`, `nginx/`, `docker-compose.yml`, etc).  
✅ **Do NOT** zip only `Dockerrun.aws.json` or `docker-compose.yml` alone.  
✅ `docker-compose.yml` must be inside the zip at the root level (not hidden in a folder).

Correct way to zip:

```bash
zip -r deploy.zip . -x '*.git*'
```
