// Command openapi-gen converts the Swagger 2.0 spec that swag generates
// from handler annotations (docs/swagger.json) into a true OpenAPI 3.0
// document (docs/openapi.json, docs/openapi.yaml) — Architecture.md §7
// asks for "OpenAPI 3", but swag itself only emits Swagger 2.0, so this
// conversion step is what actually gets us there.
//
// Usage: go run ./cmd/openapi-gen (run after `swag init`).
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/getkin/kin-openapi/openapi2"
	"github.com/getkin/kin-openapi/openapi2conv"
	"github.com/getkin/kin-openapi/openapi3"
	"gopkg.in/yaml.v3"
)

const (
	inputPath      = "docs/swagger.json"
	outputJSONPath = "docs/openapi.json"
	outputYAMLPath = "docs/openapi.yaml"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "openapi-gen:", err)
		os.Exit(1)
	}
}

func run() error {
	raw, err := os.ReadFile(inputPath)
	if err != nil {
		return fmt.Errorf("read %s (run `swag init` first): %w", inputPath, err)
	}

	var doc2 openapi2.T
	if err := json.Unmarshal(raw, &doc2); err != nil {
		return fmt.Errorf("parse swagger 2.0 doc: %w", err)
	}

	doc3, err := openapi2conv.ToV3(&doc2)
	if err != nil {
		return fmt.Errorf("convert to OpenAPI 3: %w", err)
	}

	// openapi2conv doesn't carry basePath into `servers` when `host` is
	// unset (which it always is here — the real host differs per
	// environment). Set it explicitly so path matching against this spec
	// (e.g. in contract tests) resolves "/api/v1/..." correctly.
	if len(doc3.Servers) == 0 && doc2.BasePath != "" {
		doc3.Servers = openapi3.Servers{{URL: doc2.BasePath}}
	}

	markOptionalPropertiesNullable(doc3)

	if err := doc3.Validate(context.Background()); err != nil {
		return fmt.Errorf("generated OpenAPI 3 doc is invalid: %w", err)
	}

	jsonOut, err := json.MarshalIndent(doc3, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal json: %w", err)
	}
	if err := os.WriteFile(outputJSONPath, jsonOut, 0o644); err != nil {
		return fmt.Errorf("write %s: %w", outputJSONPath, err)
	}

	var asMap map[string]any
	if err := json.Unmarshal(jsonOut, &asMap); err != nil {
		return fmt.Errorf("re-decode json for yaml conversion: %w", err)
	}
	yamlOut, err := yaml.Marshal(asMap)
	if err != nil {
		return fmt.Errorf("marshal yaml: %w", err)
	}
	if err := os.WriteFile(outputYAMLPath, yamlOut, 0o644); err != nil {
		return fmt.Errorf("write %s: %w", outputYAMLPath, err)
	}

	fmt.Printf("wrote %s and %s (%d paths)\n", outputJSONPath, outputYAMLPath, doc3.Paths.Len())
	return nil
}

// markOptionalPropertiesNullable compensates for a swag limitation: it
// never emits "x-nullable" for Go pointer fields (docs/swagger.json has
// zero occurrences), even though our DTOs consistently use *T for columns
// that can be SQL NULL and always serialize them as present-but-null, never
// omitted. swag does at least mark non-pointer fields as required, so any
// property NOT in a schema's `required` list is a pointer field in our
// codebase and is therefore accurately described as nullable.
func markOptionalPropertiesNullable(doc *openapi3.T) {
	for _, schemaRef := range doc.Components.Schemas {
		schema := schemaRef.Value
		if schema == nil || len(schema.Properties) == 0 {
			continue
		}
		required := make(map[string]bool, len(schema.Required))
		for _, name := range schema.Required {
			required[name] = true
		}
		for name, propRef := range schema.Properties {
			if !required[name] && propRef.Value != nil {
				propRef.Value.Nullable = true
			}
		}
	}
}
