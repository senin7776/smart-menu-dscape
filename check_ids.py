with open('Smartmenu/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

ids = ['owner-name', 'business-email', 'mobile-number', 'password', 'restaurant-name', 'cuisine-category', 'description', 'full-address', 'city', 'postal-code', 'contact-number', 'restaurant-email', 'website', 'tables', 'operating-hours']
for i in ids:
    print(f'{i}:', f'id="{i}"' in text)

