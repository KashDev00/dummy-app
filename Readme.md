# This Repo Contains the code for the dummy Web application.

Requires `Docker` and `minikube`.

The Front-end folder contains the code for the front end application written in Next.js with typescript.

The Back-end folder contains the code for tha backend rest API written in NodeJs With Typescript.

## DB Setup and Running
The dummy application backend uses `postgres` to store the data and `sequelize` ORM has been used to interact with the DB. 

### DB config .env file
The DB secrets are stored in the environment variable file.
The .env file needs to be in the root of the app `dummy-app/.env`. This is required for running using docker compose and deploying to a local cluster
```dotenv
POSTGRES_DB_PORT=5432
POSTGRES_DB=dummy_db
POSTGRES_USER=root
POSTGRES_PASSWORD= #your password
```
****
#### Running with Docker compose
###### Data Storage
The data stored in the Db needs to be persisted outside the container lifecycle. For this bind mount has been used.
Create a empty directory in the root of the project `dummy-app/dummy-data-volume`.

###### Running the database container 
To run the DB using Docker compose:
```shell
docker-compose up --build database
```

###### Creating dummy table
The db container would be running in the port `5432`. 
Connect to the db using the credential given in the `.env` file and execute the SQL script `/dummy-app/database/scripts/create_table.sql` 
****

#### Deploying to minikube cluster
The minikube cluster deployment uses `ConfigMap` to get the config values and pass it to the DB pod. To create the ConfigMap from the `dummy-app/.env` file run the command.
```shell
kubectl create configmap postgres-secret --from-env-file=.env
```
###### Data Storage
The data storage in minikube cluster is implemented using `PersistentVolume`(PV) and `PersistentVolumeClaims`(PVC). 
When initializing for the first time the kustomization file can be used to create the PV and PVC

###### Deploy to the minikube cluster
To Deploy DB to the cluster run the command
```shell
kubectl apply -k dummy-app/database/kubernetes
```

###### Creating dummy table
To access the DB service inside the minikube cluster. Run the command
```shell
minikube service database --url
```
This would open up a port exposing the service, use the port to connect the DB and execute the SQL script `/dummy-app/database/scripts/create_table.sql`

## Parquet Server setup and Running
The parquet service uses bind mount to store the files, create a directory `parquet` in the same level as the `compose.yml` file.
#### Running with Docker compose
```shell
docker-compose up --build parquet
```
#### Deploying to minikube cluster
```shell
kubectl apply -f dummy-app/parquet/kubernetes
```
###### Accessing the parquet files from the minikube cluster
The PV creates a folder inside the minikube docker volume and to export the files from the minikube volume, run the command
```shell
docker cp -r <minikube-containerId>:/parquet /path/on/host
```

## Running the Backend
#### Running using Docker compose
To run the container. Execute the command. This would bring up the database and the parquet server.
```shell
docker-compose up --build dummy-backend
```

#### Deploying to the cluster
The backend image needs to be loaded into the cluster. This can be done by either building the image using Docker and loading it to minikube or directly building the image inside minikube vm.
```shell
#building using docker and loading into minikube
docker build -t your-image-name:your-tag -f /dummy-app/back_end/build.Dockerfile .
minikube image load your-image-name:your-tag
```
```shell
#building inside minikube container 
minikibe image build -t your-image-name:your-tag -f /dummy-app/back_end/build.Dockerfile .
```
Once the image has been loaded in to the cluster, run this command to deploy the application.
```shell
kubectl apply -k dummy-app/back_end/kubernetes
```
