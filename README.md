# DB_BoldMort
블로그 분석을 통한 자동 볼드체 처리 크롬 익스텐션 개발

## 볼드모트 - 블로그 분석을 통한 중요 문구 자동 볼드체 처리 익스텐션 개발
### 🤝 Summary
본 연구는 여러 블로거의 블로그 작성 특징을 분석하여 중요한 콘텐츠를 자동으로 강조해주는 크롬 익스텐션을 개발함을 목표로 하였습니다. 개발된 익스텐션은 벨로그 사용자들이 글의 핵심 내용을 빠르게 파악하도록 돕고, 문구를 입력하면 자연어 처리 모델을 통해 중요 문장을 파악하고 자동으로 강조 처리합니다.


### 💡주제 선정
디지털 콘텐츠의 양이 폭발적으로 증가함에 따라, 사용자들이 중요한 정보를 신속하게 파악하는 것이 어려워졌습니다. 이와 더불어 IT기술의 발전으로 다양한 정보를 쉽게 접할 수 있게 되었습니다. 따라서, 습득된 정보를 이해하기 쉽게 정리하는 능력이 다양한 상황 속에서 요구되어 집니다. 특히, 교육 분야 및 정보 제공을 목적으로 하는 블로그 플랫폼에서는 내용의 핵심을 빠르게 이해하는 것이 중요합니다. 이러한 상황 속에서, 본 연구팀은 자연어 처리 기술을 활용하여 중요한 텍스트를 자동으로 강조해주는 도구의 필요성을 인식하고 개발에 착수하였습니다. 이를 위해, 쿠다의 ML세션과 심화세션에서 블로그로 과제를 제출하는 회원들의 블로그를 기반으로 다양한 로직을 구축하여 연구를 진행했습니다.


### 💡 연구 방법
• 데이터 수집: 다양한 블로그 글을 크롤링하여 텍스트 데이터를 수집했습니다. • 자연어 처리: 'textrankkr' 알고리즘과 추가적인 로직을 통해 중요 문장 및 단어를 추출했습니다. • 익스텐션 개발: 추출된 데이터를 기반으로 사용자의 브라우저에서 실시간으로 문장을 강조하는 크롬 익스텐션을 개발했습니다. • 사이트 통합: 개발된 익스텐션을 벨로그와 같은 인기 블로그 플랫폼에 통합하여 사용자 테스트를 수행하였습니다.

![image](https://github.com/MinhyukHong/DB_Bold/assets/108979014/4ed432a0-3241-4f30-8271-9300ea37f166)


### 👨‍💻 팀원
|팀원|역할|
|------|---|
|이승준|아이디어 빌딩, 데이터 전처리, 모델링, 백엔드 연결|
|다니아|아이디어 빌딩, 데이터 전처리, 모델링, 크롬 익스텐션|
|홍민혁|아이디어 빌딩, 데이터 전처리, 모델링, 크롬 익스텐션|
|정유진|아이디어 빌딩, 데이터 전처리, 데이터 시각화|

### 📍Data
쿠다 4기 5기 동아리원의 블로그 데이터
