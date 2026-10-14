import mysql2, { PoolOptions, QueryError, QueryResult } from "mysql2";
import { appConfig } from "./app-config";

// Data Access Layer:
class Dal {

    // Configuration for our database:
    private readonly options: PoolOptions = {
        host: appConfig.mysqlHost,
        user: appConfig.mysqlUser,
        password: appConfig.mysqlPassword,
        database: appConfig.mysqlDatabase,
        dateStrings: true, // Return DATE as "YYYY-MM-DD" instead of a JS Date that shifts with the time zone.
        decimalNumbers: true // Return DECIMAL (price) as a number instead of a string.
    };

    // Connection object:
    private readonly connection = mysql2.createPool(this.options);

    // Execute SQL:
    public execute(sql: string, values?: (string | number | boolean | null)[]): Promise<QueryResult> {

        // Promisify:
        return new Promise<QueryResult>((resolve, reject) => {

            // Go to DB, send sql, get data, invoke callback:
            this.connection.query(sql, values, (err: QueryError | null, result: QueryResult) => {

                if(err) { // Some error.
                    reject(err);
                }
                else { // All is good.
                    resolve(result);
                }

            });

        });

    }

}

export const dal = new Dal();
