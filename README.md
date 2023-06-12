## RSS агрегатор

[![Actions Status](https://github.com/michaeldobosh/frontend-project-11/workflows/hexlet-check/badge.svg)](https://github.com/michaeldobosh/frontend-project-11/actions)
[![github action status](https://github.com/michaeldobosh/frontend-project-11/workflows/Node%20CI/badge.svg)](https://github.com/michaeldobosh/frontend-project-11/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/8e35d789be7cf1a5c8dc/maintainability)](https://codeclimate.com/github/michaeldobosh/frontend-project-11/maintainability)

## Описание
**RSS Reader** - сервис для агрегации RSS-потоков, с помощью которых удобно читать разнообразные источники, например, блоги. Он позволяет добавлять неограниченное количество RSS-лент, сам их обновляет и добавляет новые записи в общий поток.
Сервис находится по адресу https://frontend-project-11-ten-eta.vercel.app/. В поле ввода вставьте ссылку с данными rss и нажмите кнопку Добавить. На экран выведется список постов для чтения. Доступен предварительный просмотр каждого поста через модальное окно с помощью кнопки Просмотр. Справа от списка постов выводится список загруженных фидов. Таким образом можно выводить на экран и отслеживать несколько источников rss данных. В случае появления новых постов в rss лене, список постов обновляется автоматически.

## Установка

1.Клонируйте репозиторий с помощью следующей команды:
```git clone https://github.com/semenChe/frontend-project-11```

2.Установите программу чтения RSS, используя следующие команды:
```make install```
```npm link```

Компиляция:

Скомпилируйте пакет с помощью webpack, используя:
```make build```

## Системные требования

- ОС: Window 10, MacOS 10.14, Ubuntu 16 или другой дистрибутив
- Процессор: Intel i3 / AMD Ryzen 3
- Операционная память: от 8 GB
- Версия node.js: от 18.14.1
