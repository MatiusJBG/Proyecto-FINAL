import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

def get_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', '')
        )
        if connection.is_connected():
            print('Conexión exitosa a la base de datos')
            return connection
    except Error as e:
        print(f'Error al conectar a MySQL: {e}')
        return None

if __name__ == '__main__':
    conn = get_connection()
    if conn:
        conn.close()
        print('Conexión cerrada')
