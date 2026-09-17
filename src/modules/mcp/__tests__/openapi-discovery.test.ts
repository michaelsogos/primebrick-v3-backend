import { describe, it, expect } from "vitest";
import { discoverEntitiesFromSpec } from "../tools/openapi-discovery.js";

describe("OpenAPI Entity Discovery", () => {
  describe("discoverEntitiesFromSpec", () => {
    it("discovers entities from a standard OpenAPI spec", () => {
      const spec = {
        openapi: "3.1.0",
        info: { title: "Test", version: "1.0.0" },
        tags: [
          { name: "provider", description: "Email provider configuration entities" },
          { name: "config_entry", description: "Module configuration key-value entries" },
        ],
        paths: {
          "/api/v1/entities/provider/meta": {
            get: { operationId: "get_provider_meta", tags: ["provider"] },
          },
          "/api/v1/entities/provider/list": {
            get: { operationId: "list_provider", tags: ["provider"] },
          },
          "/api/v1/entities/provider/{uuid}": {
            get: { operationId: "get_provider", tags: ["provider"] },
            put: { operationId: "update_provider", tags: ["provider"] },
            delete: { operationId: "delete_provider", tags: ["provider"] },
          },
          "/api/v1/entities/provider": {
            post: { operationId: "create_provider", tags: ["provider"] },
          },
        },
      };

      const entities = discoverEntitiesFromSpec(spec);

      expect(entities).toHaveLength(1);
      expect(entities[0].entity).toBe("provider");
      expect(entities[0].label).toBe("Email provider configuration entities");
      expect(entities[0].supported_operations).toContain("list");
      expect(entities[0].supported_operations).toContain("get");
      expect(entities[0].supported_operations).toContain("create");
      expect(entities[0].supported_operations).toContain("update");
      expect(entities[0].supported_operations).toContain("delete");
      expect(entities[0].supported_operations).toContain("meta");
    });

    it("discovers multiple entities", () => {
      const spec = {
        paths: {
          "/api/v1/entities/provider/list": {
            get: { tags: ["provider"] },
          },
          "/api/v1/entities/provider/{uuid}": {
            get: { tags: ["provider"] },
            put: { tags: ["provider"] },
            delete: { tags: ["provider"] },
          },
          "/api/v1/entities/provider": {
            post: { tags: ["provider"] },
          },
          "/api/v1/entities/config_entry/list": {
            get: { tags: ["config_entry"] },
          },
          "/api/v1/entities/config_entry/{uuid}": {
            get: { tags: ["config_entry"] },
            put: { tags: ["config_entry"] },
          },
          "/api/v1/entities/config_entry/meta": {
            get: { tags: ["config_entry"] },
          },
        },
        tags: [
          { name: "provider", description: "Email providers" },
          { name: "config_entry", description: "Config entries" },
        ],
      };

      const entities = discoverEntitiesFromSpec(spec);

      expect(entities).toHaveLength(2);
      const providers = entities.find((e) => e.entity === "provider");
      const configEntries = entities.find((e) => e.entity === "config_entry");

      expect(providers).toBeDefined();
      expect(providers!.supported_operations).toContain("list");
      expect(providers!.supported_operations).toContain("create");
      expect(providers!.supported_operations).toContain("delete");

      expect(configEntries).toBeDefined();
      expect(configEntries!.supported_operations).toContain("list");
      expect(configEntries!.supported_operations).toContain("get");
      expect(configEntries!.supported_operations).toContain("update");
      expect(configEntries!.supported_operations).toContain("meta");
      // config_entries has no POST or DELETE
      expect(configEntries!.supported_operations).not.toContain("create");
      expect(configEntries!.supported_operations).not.toContain("delete");
    });

    it("ignores non-entity paths (webhooks, actions, system)", () => {
      const spec = {
        paths: {
          "/webhook": {
            post: { tags: ["webhook"] },
          },
          "/api/v1/actions/send-email": {
            post: { tags: ["actions"] },
          },
          "/api/v1/openapi.json": {
            get: {},
          },
          "/health": {
            get: {},
          },
        },
      };

      const entities = discoverEntitiesFromSpec(spec);
      expect(entities).toHaveLength(0);
    });

    it("discovers restore and audit operations", () => {
      const spec = {
        paths: {
          "/api/v1/entities/customer/list": {
            get: { tags: ["customer"] },
          },
          "/api/v1/entities/customer/{uuid}": {
            get: { tags: ["customer"] },
            put: { tags: ["customer"] },
            delete: { tags: ["customer"] },
          },
          "/api/v1/entities/customer": {
            post: { tags: ["customer"] },
          },
          "/api/v1/entities/customer/{uuid}/restore": {
            post: { tags: ["customer"] },
          },
          "/api/v1/entities/customer/{uuid}/audit": {
            get: { tags: ["customer"] },
          },
          "/api/v1/entities/customer/meta": {
            get: { tags: ["customer"] },
          },
        },
        tags: [{ name: "customer", description: "Customer entities" }],
      };

      const entities = discoverEntitiesFromSpec(spec);

      expect(entities).toHaveLength(1);
      expect(entities[0].entity).toBe("customer");
      expect(entities[0].supported_operations).toContain("list");
      expect(entities[0].supported_operations).toContain("get");
      expect(entities[0].supported_operations).toContain("create");
      expect(entities[0].supported_operations).toContain("update");
      expect(entities[0].supported_operations).toContain("delete");
      expect(entities[0].supported_operations).toContain("restore");
      expect(entities[0].supported_operations).toContain("audit");
      expect(entities[0].supported_operations).toContain("meta");
    });

    it("handles empty spec", () => {
      const entities = discoverEntitiesFromSpec({});
      expect(entities).toHaveLength(0);
    });

    it("handles spec with no entity paths", () => {
      const spec = {
        paths: {
          "/webhook": { post: {} },
          "/health": { get: {} },
        },
      };
      const entities = discoverEntitiesFromSpec(spec);
      expect(entities).toHaveLength(0);
    });

    it("uses tag name as label when description is missing", () => {
      const spec = {
        paths: {
          "/api/v1/entities/item/list": {
            get: { tags: ["item"] },
          },
        },
        tags: [{ name: "item" }], // no description
      };

      const entities = discoverEntitiesFromSpec(spec);
      expect(entities).toHaveLength(1);
      expect(entities[0].label).toBe("item");
    });

    it("uses entity name as label when no tags are present", () => {
      const spec = {
        paths: {
          "/api/v1/entities/item/list": {
            get: {}, // no tags
          },
        },
      };

      const entities = discoverEntitiesFromSpec(spec);
      expect(entities).toHaveLength(1);
      expect(entities[0].label).toBe("item");
    });
  });
});
