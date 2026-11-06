import psycopg2

conn = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="Senin@968650776",
    host="db.jmqljyniphlzmpwytujs.supabase.co",
    port=5432,
    connect_timeout=10,
    sslmode="require"
)
cur = conn.cursor()

# Check schemas
cur.execute("SELECT schema_name FROM information_schema.schemata;")
schemas = [s[0] for s in cur.fetchall()]
print("Schemas:", schemas)

# Check if vault exists
if "vault" in schemas:
    try:
        cur.execute("SELECT * FROM vault.decrypted_secrets;")
        print("Vault secrets:", cur.fetchall())
    except Exception as e:
        print("Vault error:", e)

# Check postgrest config if any
try:
    cur.execute("SELECT current_setting('request.jwt.claim', true);")
    print("request.jwt.claim:", cur.fetchall())
except Exception as e:
    pass

conn.close()

