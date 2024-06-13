
#### Installation
* Ensure that Docker service is running
* Fetch the ontology display from web:
~~~bash
docker pull beiuhori07/ontology_to_knowledge_graph
~~~
* Deploy it:
~~~bash
docker run -p 3001:3001 --name ontology_to_knowledge_graph beiuhori07/ontology_to_knowledge_graph
~~~
* Now the application is hosted at __localhost:3001__:
  
#### Update the docker image:
  * Pull the latest version of the image
    ~~~bash
    docker pull beiuhori07/ontology_to_knowledge_graph
    ~~~
  * List your currently running containers (to find the one you need to update)
    ~~~bash
    docker ps
    ~~~
  * Stop the running container (replace container_id with the actual container ID from the previous step)
    ~~~bash
    docker stop container_id
    ~~~
  * Remove the stopped container (to free up the name/port and avoid conflicts)
    ~~~bash
    docker rm container_id
    ~~~
  * Run a new container with the updated image
    ~~~bash
    docker run -p 3001:3001 --name ontology_to_knowledge_graph beiuhori07/ontology_to_knowledge_graph
    ~~~
