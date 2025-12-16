`BuildDetailModalClient`컴포넌트를 수정하고자해
라이트모드와 다크모드간에 잘 어울리도록 했으면 좋겠어
나는 tailwindcss4를 사용하고 있어

---
`{build.buildingOptions?.map((opt, index) => (
                <OptionIcon key={`building-${opt.id || index}`} option={opt} />
              ))}`

              이 부분에 dark:text-gray-50을 주고 싶은데 어떻게 주지?