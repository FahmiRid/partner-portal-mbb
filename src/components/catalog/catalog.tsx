import React from 'react'
import CardSwap, { Card } from '../../blocks/Components/CardSwap/CardSwap';
import ChromaGrid from '../../blocks/Components/ChromaGrid/ChromaGrid';
import InfiniteMenu from '../../blocks/Components/InfiniteMenu/InfiniteMenu';
import { byfashe } from '../../img/usage';
import { packageD } from '../../img/usage';
export default function Catalog() {
    const items = [
        {
            image: require('../../img/PackageD.png'),
            title: "Package A",
            subtitle: "byFashé Lovely Bits",
            handle: "@byFashee",
            borderColor: "#3B82F6",
            gradient: "linear-gradient(145deg, #3B82F6, #000)",
            url: ""
        },
        {
            image: require('../../img/PackageD.png'),
            title: "Package B",
            subtitle: "byFashé Lovely Bits",
            handle: "@byFashee",
            borderColor: "#10B981",
            gradient: "linear-gradient(180deg, #10B981, #000)",
            url: ""
        },
        {
            image: require('../../img/PackageD.png'),
            title: "Package C",
            subtitle: "byFashé Lovely Bits",
            handle: "@byFashee",
            borderColor: "#10B981",
            gradient: "linear-gradient(180deg, #10B981, #000)",
            url: ""
        },
        {
            image: require('../../img/PackageD.png'),
            title: "Package D",
            subtitle: "byFashé Lovely Bits",
            handle: "@byFashee",
            borderColor: "#10B981",
            gradient: "linear-gradient(180deg, #10B981, #000)",
            url: ""
        },
        
    ];
    return (
        <div>
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