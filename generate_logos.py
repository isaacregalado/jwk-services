import os

clients = [
    "Disney", "NBA", "NYU", "Conde Nast", "Jane Street", "Pfizer", 
    "Alexandria Realty", "Blackstone", "Skadden Arps", "Emcore Penguin"
]

os.makedirs("/Users/Isaac/Desktop/jwk-services/img/clients", exist_ok=True)

template = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80">
  <rect width="200" height="80" fill="#ffffff" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#333333">
    {name}
  </text>
</svg>"""

for client in clients:
    filename = client.lower().replace(" ", "-").replace("/", "-") + ".svg"
    path = f"/Users/Isaac/Desktop/jwk-services/img/clients/{filename}"
    with open(path, "w") as f:
        f.write(template.format(name=client))
        
print("Logos generated.")