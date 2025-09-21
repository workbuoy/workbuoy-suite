import { findTool } from "../../src/buoy/tools/openapiRegistry";

describe("openapi registry", () => {
  it("matches parameterised paths", () => {
    const tools = [
      { name: "patchContact", description: "", method: "PATCH", path: "/api/v1/crm/contacts/{id}" },
    ];
    expect(findTool(tools, "PATCH", "/api/v1/crm/contacts/123")).toBeDefined();
    expect(findTool(tools, "PATCH", "/api/v1/crm/contacts")).toBeUndefined();
  });
});
