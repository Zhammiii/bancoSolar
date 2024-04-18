import { app, PORT } from "./src/app.js";
import chalk from 'chalk';

/* Levantar servidor */

app.listen(PORT, () => {
console.log(chalk.black.bgWhite.bold('CONECTACTADO AL SERVIDOR ' + PORT) )
});
