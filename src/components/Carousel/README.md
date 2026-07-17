# Carousel
轮播图组件。

This directory stores reusable carousel variants powered by Swiper.
这个目录存放基于 Swiper 的可复用轮播图类型。

`BasicCarousel` is the first minimal variant. Every child is one slide, and the carousel height follows the active child.
`BasicCarousel` 是第一个基础类型，每个子元素都是一张 slide，轮播图高度跟随当前子元素。

```tsx
import { BasicCarousel } from '@/components/Carousel'

<BasicCarousel>
    <div className="banner-one">第一张内容</div>
    <div className="banner-two">第二张内容</div>
    <div className="banner-three">第三张内容</div>
</BasicCarousel>
```
