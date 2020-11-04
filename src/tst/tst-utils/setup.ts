import { testConn } from "./testConn";

// When testing with predetermined database, set to testConn(true) to drop everytime jest is called
testConn().then(() => process.exit());