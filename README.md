# MiniGram

Фронтенд-заготовка мессенджера на Vue 3 с TypeScript и Vite.

## Стек

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Axios
- Socket.IO Client
- Tailwind CSS

UI-библиотеки намеренно не подключены.

## Требования

- Node.js 20+ (рекомендуется LTS)
- npm 10+

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

## Сборка

```bash
npm run build
```

## Предпросмотр production-сборки

```bash
npm run preview
```

## Скрипты проекта

- `npm run dev`: запуск Vite dev-сервера
- `npm run build`: проверка типов (`vue-tsc`) и сборка
- `npm run preview`: локальный предпросмотр собранного приложения

## Примечания

- Навигация реализуется через Vue Router.
- Глобальное состояние рекомендуется хранить в Pinia.
- HTTP-запросы выполняйте через Axios (лучше через общий API-клиент).
- События реального времени подключайте через Socket.IO (composables/сервисы).
