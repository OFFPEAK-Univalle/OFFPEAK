import asyncio
from app.database import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        await conn.execute(text('ALTER TABLE venues ADD COLUMN IF NOT EXISTS es_techado BOOLEAN NOT NULL DEFAULT FALSE;'))
        print('Column added')

if __name__ == '__main__':
    asyncio.run(main())
