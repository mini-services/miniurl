## Development

##### Installing

-   `docker build -t miniurl .`
-   `helm install miniurl ./helm-chart --set ingress.enable=true --set imagePullPolicy=IfNotPresent`

##### Uninstalling

-   `helm uninstall miniurl`
-   `kubectl delete pvc data-miniurl-postgresql-0`

##### Up Postgres (if not deploying via helm)

-   `docker run -d --name dev-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`
