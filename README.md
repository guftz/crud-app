```
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'crud_app'
})
```


-----

```
CREATE TABLE IF NOT EXISTS clientes (
	ID INT NOT NULL AUTO_INCREMENT,
    Nome VARCHAR(255),
    Email VARCHAR(255),
    Tel VARCHAR(20),
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS materiais (
	IDM INT NOT NULL AUTO_INCREMENT,
    Nome VARCHAR(255),
    Peso FLOAT,
    Valor_U FLOAT,
    PRIMARY KEY (IDM)
);

CREATE TABLE IF NOT EXISTS projetos (
	IDP INT NOT NULL AUTO_INCREMENT,
	Data_projeto DATE,
	Status_projeto VARCHAR(255),
	Orcamento FLOAT, 
	ID INT, 
	PRIMARY KEY (IDP),
	FOREIGN KEY (ID) REFERENCES clientes(ID)
);
```
