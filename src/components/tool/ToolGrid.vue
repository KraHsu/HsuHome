<template>
  <main class="flex flex-col-reverse sm:flex-row gap-10 grow">
    <article class="flex flex-col gap-4 grow">
      <TransitionGroup name="flip" tag="div" class="flex flex-col gap-4">
        <section v-for="tool in filtered" :key="tool.id"
          class="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 card">

          <div class="flex flex-col gap-1 max-w-[520px] min-w-[520px]">
            <div class="flex gap-2 items-center flex-wrap">
              <span v-if="tool.data.top > 0" class="color-yellow-600 dt:color-yellow-400">
                <slot name="top" />
              </span>
              <span v-if="tool.data.sensitive" class="color-red-600 dt:color-red-400">
                <slot name="sensitive" />
              </span>

              <a class="text-lg font-600" :href="toolUrl(tool)">
                {{ tool.data.title }}
              </a>

              <template v-if="tool.data.series">
                <b>|</b>
                <button class="btn-underline flex items-center gap-1" @click="chooseSeries(tool.data.series, true)">
                  <slot name="series" />
                  <span>{{ tool.data.series }}</span>
                </button>
              </template>
            </div>

            <time class="font-mono text-2.6 c-remark" :title="timeFull(tool.data.timestamp)">
              {{ timeShort(tool.data.timestamp) }}
            </time>

            <p v-if="tool.data.description" class="text-sm c-remark mt-1">
              {{ tool.data.description }}
            </p>

            <div class="mt-2 flex gap-2">
              <a v-if="tool.data.link" class="btn-link flex items-center gap-1" :href="tool.data.link" target="_blank"
                rel="noreferrer">
                <slot name="visit" />
                <span>{{ t("tool.visit") ?? "Visit" }}</span>
              </a>
              <a v-if="tool.data.repo" class="btn-link flex items-center gap-1" :href="tool.data.repo" target="_blank"
                rel="noreferrer">
                <slot name="repo" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <span class="flex items-center gap-1 sm:mr-auto c-remark flex-wrap md:pt-[28px] sm:pt-0">
            <button v-for="tag in tool.data.tags" :key="tag" class="tag-btn" @click="switchTag(tag, true)">
              <slot name="tag" />
              <span class="ml-1 text-3.5 sm:text-sm">{{ tag }}</span>
            </button>
          </span>

        </section>
      </TransitionGroup>
    </article>

    <!-- 侧边筛选 -->
    <aside class="sm:flex-basis-200px flex flex-col gap-5">
      <section>
        <h3 class="mb-2">{{ t("tool.series") ?? "Series" }}</h3>
        <p class="flex flex-wrap gap-2">
          <button v-for="s in seriesList" :key="s" class="chip" :class="{ selected: s === series }"
            @click="chooseSeries(s)">
            {{ s }}
          </button>
        </p>
      </section>

      <section>
        <h3 class="mb-2">{{ t("tool.tag") ?? "Tags" }}</h3>
        <p class="flex flex-wrap gap-2">
          <button v-for="tg in tagList" :key="tg" class="chip" :class="{ selected: tags.includes(tg) }"
            @click="switchTag(tg)">
            {{ tg }}
          </button>
        </p>
      </section>
    </aside>
  </main>
</template>

<script setup lang="ts">
import { getRelativeLocaleUrl } from "astro:i18n";
import { ref, computed } from "vue";
import i18nit from "$i18n";
import Time from "$utils/time";

type ToolItem = {
  id: string;
  data: {
    title: string;
    timestamp: Date;
    series?: string;
    tags?: string[];
    top: number;
    sensitive?: boolean;
    description?: string;
    link?: string;
    repo?: string;
  };
};

const props = defineProps<{
  locale: string;
  tools: ToolItem[];
  series: string[];
  tags: string[];
}>();

const t = i18nit(props.locale);

// 选中状态（仅筛选，不分页）
const series = ref<string | null>(null);
const tags = ref<string[]>([]);

// 过滤 + 排序（置顶优先，时间倒序）
const filtered = computed(() => {
  return props.tools
    .filter((tool) => {
      const matchSeries = !series.value || tool.data.series === series.value;
      const matchTags = tags.value.every((tg) => tool.data.tags?.includes(tg));
      return matchSeries && matchTags;
    })
    .sort(
      (a, b) =>
        b.data.top - a.data.top ||
        new Date(b.data.timestamp).getTime() - new Date(a.data.timestamp).getTime()
    );
});

// 操作
function switchTag(tag: string, turn?: boolean) {
  const included = tags.value.includes(tag);
  const final = turn ?? !included;
  tags.value = final ? (included ? tags.value : [...tags.value, tag]) : tags.value.filter((t) => t !== tag);
}

function chooseSeries(choice: string, turn?: boolean) {
  const final = turn ?? series.value !== choice;
  series.value = final ? choice : null;
}

// 工具方法：时间/链接
function timeFull(d: Date) {
  return Time.full(d);
}

function timeShort(d: Date) {
  return Time(d);
}

function toolUrl(tool: ToolItem) {
  // 去除语言前缀部分
  const path = `/tool/${tool.id.split("/").slice(1).join("/")}`;
  return getRelativeLocaleUrl(props.locale, path);
}

// 提供给模板的列表
const seriesList = computed(() => props.series);
const tagList = computed(() => props.tags);
</script>

<style scoped lang="less">
.chip {
  border-bottom: 1px solid var(--primary-color);
  padding: 0rem 0.2rem;

  font-size: 0.9rem;
  transition:
    color 0.1s ease-in-out,
    background-color 0.1s ease-in-out;

  @media (min-width: 640px) {
    &:hover {
      color: var(--background-color);
      background-color: var(--primary-color);
    }
  }

  &.selected {
    color: var(--background-color);
    background-color: var(--primary-color);
  }
}

.btn-link {
  border-bottom: 1px solid var(--primary-color);
  padding: 0rem 0.2rem;

  font-size: 0.9rem;
  transition:
    color 0.1s ease-in-out,
    background-color 0.1s ease-in-out;

  @media (min-width: 640px) {
    &:hover {
      color: var(--background-color);
      background-color: var(--primary-color);
    }
  }
}
</style>