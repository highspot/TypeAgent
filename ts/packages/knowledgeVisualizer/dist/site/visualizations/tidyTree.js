// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { curveBumpX, stratify, link, create, tree, hierarchy } from "d3";
export class TidyTree {
    constructor(data, config) {
        this.config = config;
        this.update(data);
    }
    update(data) {
        if (data.length == 0) {
            return create("svg").node();
        }
        const root = this.config.path != null
            ? stratify().path(this.config.path)(data)
            : this.config.id != null || this.config.parentId != null
                ? stratify()
                    .id(this.config.id)
                    .parentId(this.config.parentId)(data)
                : hierarchy(data, this.config.children);
        // sort the nodes.
        if (this.config.sort != null)
            root.sort(this.config.sort);
        // human readable identifiers
        const descendants = root.descendants();
        const L = this.config.label == null
            ? null
            : descendants.map((d) => this.config.label(d.data, d));
        // layout
        const dx = 10;
        const dy = this.config.width / (root.height + this.config.padding);
        tree().nodeSize([dx, dy])(root);
        // center verticaly
        let x0 = Infinity;
        let x1 = -x0;
        root.each((d) => {
            if (d.x > x1)
                x1 = d.x;
            if (d.x < x0)
                x0 = d.x;
        });
        // calculate height if it's not specified
        if (this.config.height === undefined)
            this.config.height = x1 - x0 + dx * 2;
        // make sure we have a curve
        if (typeof this.config.curve !== "function")
            throw new Error(`Unsupported curve`);
        const svg = create("svg")
            .attr("viewBox", [
            (-dy * this.config.padding) / 2,
            x0 - dx,
            this.config.width,
            this.config.height,
        ])
            .attr("width", this.config.width)
            .attr("height", this.config.height)
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10);
        svg.append("g")
            .attr("fill", "none")
            .attr("stroke", this.config.stroke)
            .attr("stroke-opacity", this.config.strokeOpacity)
            .attr("stroke-linecap", this.config.strokeLinecap)
            .attr("stroke-linejoin", this.config.strokeLinejoin)
            .attr("stroke-width", this.config.strokeWidth)
            .selectAll("path")
            .data(root.links())
            .join("path")
            .attr("d", link(this.config.curve)
            .x((d) => d.y)
            .y((d) => d.x));
        const node = svg
            .append("g")
            .selectAll("a")
            .data(root.descendants())
            .join("a")
            .attr("xlink:href", this.config.link == null
            ? null
            : (d) => this.config.link(d.data, d))
            .attr("target", this.config.link == null ? null : this.config.linkTarget)
            .attr("transform", (d) => `translate(${d.y},${d.x})`);
        node.append("circle")
            .attr("fill", (d) => d.children ? this.config.stroke : this.config.fill)
            .attr("r", this.config.r);
        if (this.config.title != null) {
            node.append("title").text((d) => this.config.title(d.data, d));
        }
        if (L)
            node.append("text")
                .attr("dy", "0.32em")
                .attr("x", (d) => (d.children ? -6 : 6))
                .attr("text-anchor", (d) => (d.children ? "end" : "start"))
                .attr("paint-order", "stroke")
                .attr("stroke", this.config.halo)
                .attr("stroke-width", this.config.haloWidth)
                .text((_, i) => {
                return L[i];
            });
        this.tree = svg.node();
    }
}
export const defaultTidyTreeConfig = {
    path: null,
    id: null,
    parentId: null,
    //id: (data: any) => { return Array.isArray(data) ? (d: any) => { return d.id } : null },
    //parentId: (data: any) => { return Array.isArray(data) ? (d: any) => { return d.parentId } : null },
    label: null,
    tree: tree,
    linkTarget: "_blank",
    width: 800,
    height: 640,
    r: 3,
    padding: 1,
    fill: "#999",
    stroke: "#555",
    strokeWidth: 1.5,
    strokeOpacity: 0.4,
    halo: "#fff",
    haloWidth: 3,
    curve: curveBumpX,
};
//# sourceMappingURL=tidyTree.js.map