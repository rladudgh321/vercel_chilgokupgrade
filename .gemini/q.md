CardSlide컴포넌트에서 slide를 넘길 때마다 breakpoints의 색깔을 수정하고 싶어.
밝은 테마에서도 어두운 테마에서도 어울리는 색깔을 해줘 나는 tailwindcss를 사용하고 있어.
---
style={{
          "--swiper-pagination-color": "#ff0000",
    // 비활성 dot 색
      "--swiper-pagination-bullet-inactive-color": "#999",
        }}

        ---
      이렇게 하니까 되더라 어두운테마에서도 밝은 테마에서도 작동되게끔해줘
      ---
      밝은테마에서는 적당한데 어두운테마에서는 active한것은 빨간색으로 해주고 inactive한것은 하얀색으로 해줘