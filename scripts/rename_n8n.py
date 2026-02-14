import json
import re
import sys

def rename_nodes(file_path, renames):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Helper function to replace references in strings
    def replace_refs(text):
        if not isinstance(text, str):
            return text
        for old, new in renames.items():
            # Replace $('Old Name') -> $('New Name')
            text = text.replace(f"$('{old}')", f"$('{new}')")
            # Replace $node["Old Name"] -> $node["New Name"]
            text = text.replace(f'$node["{old}"]', f'$node["{new}"]')
            # Replace $node['Old Name'] -> $node['New Name']
            text = text.replace(f"$node['{old}']", f"$node['{new}']")
        return text

    # Recursive function to traverse and update arbitrary JSON structure
    def update_structure(obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                obj[k] = update_structure(v)
        elif isinstance(obj, list):
            return [update_structure(i) for i in obj]
        elif isinstance(obj, str):
            return replace_refs(obj)
        return obj

    # 1. Update Node Names and their internal parameters
    for node in data['nodes']:
        if node['name'] in renames:
            node['name'] = renames[node['name']]
        
        # Deep traverse parameters to update references
        node['parameters'] = update_structure(node['parameters'])

    # 2. Rebuild Connections
    new_connections = {}
    for source_node, outputs in data['connections'].items():
        # Update key (Source Node Name)
        new_source = renames.get(source_node, source_node)
        
        # Update connections list
        new_outputs = {}
        for output_name, connection_list in outputs.items():
            new_list = []
            for conn in connection_list:
                # Update target node name
                if 'node' in conn:
                    conn['node'] = renames.get(conn['node'], conn['node'])
                new_list.append(conn)
            new_outputs[output_name] = new_list
            
        new_connections[new_source] = new_outputs
    
    data['connections'] = new_connections

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    file_path = sys.argv[1]
    # Parse renames from remaining args: old=new old2=new2
    renames = {}
    for arg in sys.argv[2:]:
        old, new = arg.split('=')
        renames[old] = new
    
    rename_nodes(file_path, renames)
    print(f"Successfully processed {file_path}")
