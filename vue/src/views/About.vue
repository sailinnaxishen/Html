<template>
  <div class="about-page">
    <header class="header">
      <div class="header-left">
        <el-button @click="router.push('/')" :icon="ArrowLeft">返回</el-button>
        <h1>关于项目</h1>
      </div>
    </header>

    <main class="main-content">
      <div class="tech-stack">
        <h2>技术栈</h2>
        <div class="tech-grid">
          <!-- 前端技术 -->
          <div class="tech-section">
            <h3>前端技术</h3>
            <div class="tech-list">
              <div class="tech-item">
                <el-icon><Monitor /></el-icon>
                <div class="tech-info">
                  <h4>Vue 3</h4>
                  <p>使用Vue3组合式API开发，提供更好的代码组织和复用性</p>
                </div>
              </div>
              <div class="tech-item">
                <el-icon><ElementPlus /></el-icon>
                <div class="tech-info">
                  <h4>Element Plus</h4>
                  <p>基于 Vue 3 的组件库，提供美观的 UI 组件和交互体验</p>
                </div>
              </div>
              <div class="tech-item">
                <el-icon><Setting /></el-icon>
                <div class="tech-info">
                  <h4>Vite</h4>
                  <p>现代化的前端构建工具，提供更快的开发体验</p>
                </div>
              </div>
              <div class="tech-item">
                <el-icon><Brush /></el-icon>
                <div class="tech-info">
                  <h4>SCSS</h4>
                  <p>使用 SCSS 预处理器，提供更强大的样式编写能力</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 后端技术 -->
          <div class="tech-section">
            <h3>后端技术</h3>
            <div class="tech-list">
              <div class="tech-item">
                <el-icon><Platform /></el-icon>
                <div class="tech-info">
                  <h4>Node.js</h4>
                  <p>使用Node.js作为运行环境，提供高性能的服务器端支持</p>
                </div>
              </div>
              <div class="tech-item">
                <el-icon><Connection /></el-icon>
                <div class="tech-info">
                  <h4>Express</h4>
                  <p>轻量级的 Web 应用框架，提供灵活的路由和中间件系统</p>
                </div>
              </div>
              <div class="tech-item">
                <el-icon><Files /></el-icon>
                <div class="tech-info">
                  <h4>MongoDB</h4>
                  <p>使用 MongoDB 作为数据库，提供灵活的文档存储方案</p>
                </div>
              </div>
              <div class="tech-item">
                <el-icon><Box /></el-icon>
                <div class="tech-info">
                  <h4>Docker</h4>
                  <p>使用Docker容器化部署，提供高效的环境配置部署体验</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 功能特性 -->
          <div class="tech-section">
            <h3>功能特性</h3>
            <div class="tech-list">
              <div class="tech-item">
                <el-icon><Folder /></el-icon>
                <div class="tech-info">
                  <h4>文件管理</h4>
                  <p>支持文件上传、下载、删除等基本操作</p>
                </div>
              </div>
              <div class="tech-item">
                <el-icon><Cpu /></el-icon>
                <div class="tech-info">
                  <h4>系统监控</h4>
                  <p>实时监控系统 CPU 和内存使用情况</p>
                </div>
              </div>
              <div class="tech-item">
                <el-icon><TrendCharts /></el-icon>
                <div class="tech-info">
                  <h4>实时热搜</h4>
                  <p>支持 Bilibili 和微博热搜实时展示</p>
                </div>
              </div>
              <div class="tech-item">
                <el-icon><Moon /></el-icon>
                <div class="tech-info">
                  <h4>暗色模式</h4>
                  <p>支持明暗主题切换，提供更好的用户体验</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="about-content">
        <div class="copyright-section">
          <h2>版权信息</h2>
          <p>版权所有© <a href="https://github.com/sailinnaxishen" target="_blank">sailinnaxishen</a></p>
          <div class="license-info">
            <p>本站全部内容禁止商业使用。文本内容除另有声明外，均在<a href="https://creativecommons.org/licenses/by-nc-sa/3.0/cn/" target="_blank">
            知识共享 署名-非商业性使用-相同方式共享 3.0 中国大陆（CC BY-NC-SA 3.0 CN）
          </a>许可协议下提供，附加条款亦可能应用</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import {
  ArrowLeft,
  Monitor,
  ElementPlus,
  Setting,
  Brush,
  Platform,
  Connection,
  Box,
  Folder,
  TrendCharts,
  Moon,
  Files,
  Cpu,
} from "@element-plus/icons-vue";

const router = useRouter();
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  padding: 2rem;
  overflow-y: auto;
  height: 100vh;
  position: relative;
}

.header {
  padding: 1rem 0;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;

    h1 {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(
        45deg,
        var(--primary-color),
        var(--secondary-color)
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}

.main-content {
  .tech-stack {
    h2 {
      font-size: 1.8rem;
      color: var(--text-color);
      margin: 1rem;
    }

    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .tech-section {
      h3 {
        margin-bottom: 1.5rem;
        font-size: 1.4rem;
        color: var(--text-color);
      }

      .tech-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .tech-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: var(--item-bg);
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            background: var(--item-hover-bg);
          }

          .el-icon {
            font-size: 2rem;
            color: var(--primary-color);
          }

          .tech-info {
            flex: 1;

            h4 {
              margin-bottom: 0.5rem;
              color: var(--text-color);
              font-size: 1.1rem;
            }

            p {
              color: var(--text-secondary);
              font-size: 0.9rem;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }

  .about-content {
    margin-top: 3rem;
    margin: 1rem;
    .copyright-section {
      border-radius: 8px;
      padding: 1rem;
      h2 {
        font-size: 1.4rem;
        color: var(--text-color);
        text-align: center;
      }

      p {
        color: var(--text-secondary);
        line-height: 1.6;
        text-align: center;
      }

      .license-info {
        a {
          color: var(--primary-color);
          text-decoration: none;
          &:hover {
            text-decoration: underline;
          }
        }

        ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          color: var(--text-secondary);
          
          li {
            margin-bottom: 0.5rem;
            
            ul {
              margin-top: 0.5rem;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .about-page {
    padding: 1rem;
    height: calc(100vh - 2rem);
  }

  .header {
    .header-left {
      h1 {
        font-size: 1.5rem;
      }
    }
  }

  .main-content {
    .tech-stack {
      h2 {
        font-size: 1.5rem;
      }

      .tech-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style> 