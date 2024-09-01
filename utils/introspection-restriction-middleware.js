import pkg from "lodash";
const { get } = pkg;

const introspectionRestrictionMiddleware = (req, res, next) => {
  const query = req?.query?.query || req?.body?.query || "";

  // Retrieve the introspection restriction secret from headers
  const introspectionHeader = get(
    req,
    "headers.x-introspection-restriction-secret"
  );

  // If the query contains '__schema' and the secret is incorrect or missing, block introspection
  if (
    query.includes("__schema") &&
    introspectionHeader !== GRAPHQL_INTROSPECTION_RESTRICTION.SECRET
  ) {
    return res
      .status(403)
      .json({ error: "Forbidden: Introspection is disabled." });
  }

  return next();
};

export default introspectionRestrictionMiddleware;
