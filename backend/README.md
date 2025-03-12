```sh
npm install
npm run dev
```

```sh
npm run deploy
```

```sh
docker run -d --name my_postgres -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -v pgdata:/var/lib/postgresql/data -p 5432:5432 postgres
```