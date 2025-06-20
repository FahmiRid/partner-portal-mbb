import React from 'react'
import ChromaGrid from '../../blocks/Components/ChromaGrid/ChromaGrid';
import { ppHomeCustom } from '../../stylesStore/stylesGlobal';

export default function Catalog() {
    const items = [
        {
            image: require('../../img/packageA.jpeg'),
            title: "Package A",
            subtitle: "Sales: RM 11.90",
            handle: "@byFashee",
            borderColor: "#3B82F6",
            gradient: "linear-gradient(145deg, #3B82F6, #000)",
            url: ""
        },
        {
            image: require('../../img/packageB.jpeg'),
            title: "Package B",
            subtitle: "Sales: RM 12.00",
            handle: "@byFashee",
            borderColor: "#10B981",
            gradient: "linear-gradient(180deg, #10B981, #000)",
            url: ""
        },
        {
            image: require('../../img/packageC.jpeg'),
            title: "Package C",
            subtitle: "Sales: RM 12.50",
            handle: "@byFashee",
            borderColor: "#10B981",
            gradient: "linear-gradient(180deg, #10B981, #000)",
            url: ""
        },
        {
            image: require('../../img/PackageD.png'),
            title: "Package D",
            subtitle: "Sales: RM 8.90",
            handle: "@byFashee",
            borderColor: "#10B981",
            gradient: "linear-gradient(180deg, #10B981, #000)",
            url: ""
        },
        {
            image: require('../../img/mensSet.jpeg'),
            title: "Package D",
            subtitle: "Sales: Rm10.90",
            handle: "@byFashee",
            borderColor: "#10B981",
            gradient: "linear-gradient(180deg, #10B981, #000)",
            url: ""
        },
        {
            image: require('../../img/glowkit.png'),
            title: "Glow Kit ",
            subtitle: "Sales: Rm15.00",
            handle: "@byFashee",
            borderColor: "#10B981",
            gradient: "linear-gradient(180deg, #10B981, #000)",
            url: ""
        },
        
    ];
    return (
        <div>
            <h1 className={`container-fluid ${ppHomeCustom}`}>Catalog Product</h1>
            <ChromaGrid
                items={items}
                radius={300}
                damping={0.45}
                fadeOut={0.6}
                ease="power3.out"
            />
        </div>
    )
}