# 🎮 FBNeo Emulator

Эмулятор аркадных игр на базе FBNeo для браузера.

## 🚀 Запуск

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Запустите локальный сервер:**
   ```bash
   python3 -m http.server 8000
   ```
   или
   ```bash
   npx http-server
   ```

3. **Откройте браузер и перейдите по адресу:**
   ```
   http://localhost:8000
   ```

4. **Выберите один из ваших ROM файлов:**
   - `tmnt.zip` - Teenage Mutant Ninja Turtles
   - `tmnt2.zip` - Teenage Mutant Ninja Turtles 2

## 🎯 Как использовать

1. Нажмите кнопку "📁 Выбрать ROM файл"
2. Выберите один из ваших ZIP файлов (tmnt.zip или tmnt2.zip)
3. Эмулятор автоматически загрузит и запустит игру
4. Используйте клавиатуру для управления

## 🎮 Управление

- **Стрелки** - Движение
- **Z** - Кнопка A
- **X** - Кнопка B  
- **C** - Кнопка C
- **V** - Кнопка D

## 📁 Поддерживаемые форматы

- ZIP файлы с ROM
- ROM файлы (.rom, .bin)

## 🛠️ Технические детали

- Использует пакет `@mantou/fbneo` версии 0.0.4
- Работает в браузере через WebAssembly
- Поддерживает большинство аркадных игр, совместимых с FBNeo

## 🔧 Устранение неполадок

Если эмулятор не запускается:
1. Убедитесь, что все зависимости установлены
2. Проверьте консоль браузера на наличие ошибок
3. Убедитесь, что ROM файлы не повреждены
4. Попробуйте другой браузер (рекомендуется Chrome или Firefox) 