import { default as DBM } from "../database/DatabaseManager";
import { QueryBuilder as QB } from "knex";

export type DatabaseManager = DBM;
export type QueryBuilder = QB;