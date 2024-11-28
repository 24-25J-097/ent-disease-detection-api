

## Installation

1. Clone the repository:

```bash
git clone 
```

2. Navigate to the project directory:

```bash
cd ent-disease-detection-api
```

3. Install dependencies:

```bash
npm install
```

4. Set up environment variables by creating a `.env` file and populating it with necessary values:

```plaintext
Follow the .env.example file and update with correct values.
```

5. Connect MongoDB server.
```plaintext
Open MongoDb Compass -> Connect
```

6. Start the server:

```bash
npm start
```


## Testing

To run tests, follow these steps:

1. Install development dependencies:

```bash
npm install --dev
```

2. Run tests:

```bash
npm test
```
```bash
npm run test:watch
```

3. Run tests by Order:

```bash
jest auth.test.ts
```

```bash
jest admin.test.ts
```

## Checking Logs

```bash
tail -f log\request.log
```

```bash
tail -f log\app.log
```

```bash
tail -f log\error.log
```


---
## License

This project is licensed under the [MIT License](LICENSE).

---
