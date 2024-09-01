import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import authDirective from "./authDirective.js";

const directivesObj = {
  isAuthenticated: authDirective,
};

const applyDirective = (schema) => {
  Object.keys(directivesObj).forEach((directiveName) => {
    const directive = directivesObj[directiveName](directiveName, schema);
    schema = mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const directiveArgs = getDirective(
          schema,
          fieldConfig,
          directiveName
        )?.[0];
        if (directiveArgs) {
          return directive(fieldConfig);
        }
      },
    });
  });

  return schema;
};

export default applyDirective;
