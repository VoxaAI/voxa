/// <reference types="node" />
import * as http from "http";
import { VoxaReply } from "./../VoxaReply";
import { VoxaAdapter } from "./VoxaAdapter";
declare function createServer(skill: VoxaAdapter<VoxaReply>): http.Server;
export { createServer };
