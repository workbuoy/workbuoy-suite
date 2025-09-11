import express from "express";
import bodyParser from "body-parser";
import { requestContext } from "./core/middleware/requestContext";
import { errorHandler } from "./core/middleware/errorHandler";
import crmRoutes from "./features/crm/contacts.route";

const app = express();
app.use(bodyParser.json());
app.use(requestContext);
app.use(crmRoutes);
app.use(errorHandler);

export default app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`listening on ${port}`);
  });
}
