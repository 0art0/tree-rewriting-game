import * as React from 'react';
import Tree from 'react-d3-tree';
import { CodeWithInfos, DocumentPosition, InteractiveCode } from '@leanprover/infoview';
import type { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree/lib/types/types/common';

export type DisplayTree =
  { node: { label: string, children: Array<DisplayTree> } }

export type TreeNodeDatum = RawNodeDatum & { label?: string }

function treeToData(tree: DisplayTree): TreeNodeDatum {
    const { label, children } = tree.node
    if (!Array.isArray(children)) {
        throw new Error("Children are not an array")
    }    
    if (children.length == 0) {
        return {
            name: 'node',
            label: label
          }          
    } else {
        const childrenAsTrees = children.map(treeToData)
        return {
            name: 'node',
            label: label,
            children: childrenAsTrees
        }
    }  
}

function renderForeignObjectNode({ nodeDatum }: CustomNodeElementProps, _: DocumentPosition,
  foreignObjectProps: React.SVGProps<SVGForeignObjectElement>): JSX.Element {
  const nodeDatum_ = nodeDatum as TreeNodeDatum
  return (
    <g>
      <rect x="-50" y="-10" width="100" height="20" fill="green" style={{ border: "black" }} />
      <foreignObject {...foreignObjectProps} style={{ textAlign: "center" }}>
        {nodeDatum_.label}
      </foreignObject>
    </g>
  )
}

function centerTree (r : React.RefObject<HTMLDivElement>, t : any, setT : React.Dispatch<any>) {
    React.useLayoutEffect(() => {
        const elt = r.current
        if (elt == null) { return }
        if (t != null) { return }
        const b = elt.getBoundingClientRect()
        if (!b.width || !b.height) { return }
        setT({ x: b.width / 2, y: 20 })
    })
}

export function renderDisplayTree({ pos, tree, r }: 
    { pos: DocumentPosition, tree: DisplayTree, r : React.RefObject<HTMLDivElement> }): 
    JSX.Element {
    const nodeSize = { x: 120, y: 40 }
    const foreignObjectProps = { width: 100, height: 30, y: -10, x: -50 }
    const [t, setT] = React.useState<any | null>(null)
    centerTree(r, t, setT)
    return (
        <Tree
          data={treeToData(tree)}
          translate={t ?? { x: 0, y: 0 }}
          nodeSize={nodeSize}
          renderCustomNodeElement={rd3tProps =>
            renderForeignObjectNode(rd3tProps, pos, foreignObjectProps)}
          orientation='vertical'
          pathFunc={'straight'} />
    )
}

function renderDisplay({ pos, tree }: { pos: DocumentPosition, tree: DisplayTree }): 
    JSX.Element {
    const r = React.useRef<HTMLDivElement>(null)
    return (
    <div
      style={{
        height: '400px',
        display: 'inline-flex',
        minWidth: '600px',
        border: '1px solid rgba(100, 100, 100, 0.2)',
        overflow: 'hidden', 
        resize: 'both',
        opacity: '0.9',
      }}
      ref={r}
    >
    {renderDisplayTree( {pos, tree, r} )}
    </div>)
}

export default function ({ pos, tree }: { pos: DocumentPosition, tree: DisplayTree }): JSX.Element { 
    return renderDisplay({pos, tree})
}