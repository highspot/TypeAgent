/**
 * Schema for a type
 */
export type TypeSchema = {
    /**
     * Name of the type for which this is a schema
     */
    typeName: string;
    /**
     * Schema text for the type
     */
    schemaText: string;
};
/**
 * Loads schema files and combines them into one
 * Also removes all import statements from the combined file, to prevent
 * module install/dependency issues when TypeChat validates messages
 * @param filePaths file paths to import from
 * @param basePath base path if file paths are relative
 * @returns
 */
export declare function loadSchema(filePaths: string[], basePath?: string): string;
//# sourceMappingURL=schema.d.ts.map