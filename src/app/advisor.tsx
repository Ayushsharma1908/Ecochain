import { router } from "expo-router";
import {
  ChevronLeft,
  Lightbulb,
  MapPin,
  Recycle,
  ScanLine,
  Sparkles,
  TreePine
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, View } from "react-native";

import { Text } from "@/components/ui";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useCurrentContext } from "@/context/CurrentContext";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { useTheme } from "@/hooks/use-theme";
import { AI_PROMPTS, askAdvisor, generateAIReport } from "@/lib/aiAdvisor";
import type { AIReport, AiPrompt } from "@/types/domain";

type ChatExchange = {
  id: string;
  prompt: AiPrompt;
  answer: string;
};

// ─── Section reveal wrapper ───
function Section({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay, type: "timing", duration: 420 }}
      style={style}
    >
      {children}
    </MotiView>
  );
}

// ─── Step number ───
function StepNumber({ n, color }: { n: number; color: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        variant="monoSm"
        style={{
          fontSize: 10,
          fontFamily: "JetBrainsMono_700Bold",
          color: "#FFFFFF",
        }}
      >
        {n}
      </Text>
    </View>
  );
}

// ─── Timeline node ───
function TimelineNode({
  label,
  isLast,
  index,
}: {
  label: string;
  isLast: boolean;
  index: number;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <View style={{ alignItems: "center", width: 20, marginRight: Space.md }}>
        <MotiView
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 600 + index * 100,
            type: "spring",
            damping: 12,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: theme.lichen,
            }}
          />
        </MotiView>
        {!isLast && (
          <View
            style={{
              width: 1.5,
              height: 28,
              backgroundColor: theme.border,
              marginTop: 4,
            }}
          />
        )}
      </View>
      <Text
        variant="body"
        style={{
          flex: 1,
          paddingBottom: isLast ? 0 : Space.lg,
          lineHeight: 22,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Metric row for environmental impact ───
function ImpactRow({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) {
  const theme = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateX: -8 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: 500 + index * 80, type: "timing", duration: 300 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: Space.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderLight,
        }}
      >
        <Text variant="body" color={theme.textSecondary}>
          {label}
        </Text>
        <Text variant="body" style={{ fontFamily: "Archivo_600SemiBold" }}>
          {value}
        </Text>
      </View>
    </MotiView>
  );
}

// ─── Typing indicator ───
function TypingIndicator() {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: Space.sm,
        paddingHorizontal: Space.md,
      }}
    >
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.3, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: i * 150,
            type: "timing",
            duration: 400,
            loop: true,
            repeatReverse: true,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.gold,
            }}
          />
        </MotiView>
      ))}
    </View>
  );
}

// ─── Chat bubble ───
function ChatBubble({
  exchange,
  index,
}: {
  exchange: ChatExchange;
  index: number;
}) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: Space.lg }}>
      {/* User question */}
      <MotiView
        from={{ opacity: 0, translateX: 16 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{
          delay: index * 120,
          type: "timing",
          duration: 300,
        }}
        style={{ alignItems: "flex-end" }}
      >
        <View
          style={{
            maxWidth: "82%",
            backgroundColor: theme.lichen,
            paddingHorizontal: Space.lg,
            paddingVertical: Space.md,
            borderRadius: Radius.lg,
            borderBottomRightRadius: Radius.xs,
          }}
        >
          <Text variant="body" style={{ color: "#FFFFFF", lineHeight: 21 }}>
            {exchange.prompt.question}
          </Text>
        </View>
      </MotiView>

      {/* AI answer */}
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          delay: index * 120 + 200,
          type: "timing",
          duration: 350,
        }}
        style={{ alignItems: "flex-start", marginTop: Space.sm }}
      >
        <View
          style={{
            maxWidth: "92%",
            backgroundColor: theme.card,
            paddingHorizontal: Space.lg,
            paddingVertical: Space.md + 2,
            borderRadius: Radius.lg,
            borderBottomLeftRadius: Radius.xs,
            borderWidth: 1,
            borderColor: theme.borderLight,
            ...Shadow.sm,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: Space.xs,
              marginBottom: Space.sm,
            }}
          >
            <Sparkles size={12} color={theme.gold} strokeWidth={2} />
            <Text
              variant="monoSm"
              color={theme.gold}
              style={{ fontFamily: "JetBrainsMono_700Bold" }}
            >
              AI
            </Text>
          </View>
          <Text variant="body" style={{ lineHeight: 22 }}>
            {exchange.answer}
          </Text>
        </View>
      </MotiView>
    </View>
  );
}

// ─── Empty state (no context) ───
function NoContextView() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: Space.lg,
          paddingTop: 56,
          paddingBottom: Space.sm,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ChevronLeft size={24} color={theme.text} />
        </Pressable>
        <Text
          variant="body"
          style={{
            fontFamily: "Archivo_600SemiBold",
            marginLeft: Space.sm,
          }}
        >
          AI Advisor
        </Text>
      </View>

      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 150, type: "timing", duration: 450 }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: Space.xl,
          paddingBottom: 80,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: Radius.pill,
            backgroundColor: theme.goldSoft,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: Space.xl,
          }}
        >
          <Sparkles size={30} color={theme.gold} strokeWidth={1.5} />
        </View>
        <Text variant="h1" style={{ textAlign: "center" }}>
          Scan something first
        </Text>
        <Text
          variant="body"
          color={theme.textSecondary}
          style={{
            textAlign: "center",
            marginTop: Space.sm,
            maxWidth: 270,
            lineHeight: 22,
          }}
        >
          The AI advisor needs a product to analyze. Scan a barcode to get
          started.
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/scan")}
          style={({ pressed }) => ({
            marginTop: Space["2xl"],
            flexDirection: "row",
            alignItems: "center",
            gap: Space.sm,
            paddingHorizontal: Space.xl,
            paddingVertical: Space.md + 2,
            borderRadius: Radius.pill,
            backgroundColor: theme.lichen,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <ScanLine size={16} color="#FFFFFF" strokeWidth={2} />
          <Text variant="button" style={{ color: "#FFFFFF" }}>
            Go scan
          </Text>
        </Pressable>
      </MotiView>
    </View>
  );
}

// ─── Main screen ───
export default function AdvisorScreen() {
  const theme = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuthGate();
  const { context } = useCurrentContext();
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exchanges, setExchanges] = useState<ChatExchange[]>([]);
  const [pendingPromptId, setPendingPromptId] = useState<string | null>(null);
  const requestLock = useRef(false);
  const reportRequestKey = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace({ pathname: "/login", params: { redirect: "/advisor" } });
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!context) return;

    const requestKey = context.product.barcode;
    if (reportRequestKey.current === requestKey) return;

    reportRequestKey.current = requestKey;
    let cancelled = false;

    setReport(null);
    setExchanges([]);
    setLoading(true);

    generateAIReport(context)
      .then((res) => {
        if (!cancelled) setReport(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [context, isAuthenticated]);

  if (!isAuthenticated) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  const ask = async (prompt: AiPrompt) => {
    if (!context || requestLock.current || pendingPromptId) return;

    requestLock.current = true;
    setPendingPromptId(prompt.id);

    try {
      const answer = await askAdvisor(prompt.id, context, report ?? undefined);
      const exchangeId = `${prompt.id}-${Date.now()}`;

      setExchanges((prev) => {
        const duplicate = prev.some(
          (entry) => entry.prompt.id === prompt.id && entry.answer === answer,
        );
        return duplicate ? prev : [...prev, { id: exchangeId, prompt, answer }];
      });
    } finally {
      requestLock.current = false;
      setPendingPromptId(null);
    }
  };

  // ── No context ──
  if (!context) {
    return <NoContextView />;
  }

  const isLoading = loading || !report;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={exchanges}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Space.lg,
          paddingBottom: Space["4xl"],
        }}
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: 0 }}>
            <ChatBubble exchange={item} index={index} />
          </View>
        )}
        ListHeaderComponent={
          <>
            {/* ─── Header ─── */}
            <MotiView
              from={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingTop: 56,
                  paddingBottom: Space.lg,
                }}
              >
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={12}
                  style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                >
                  <ChevronLeft size={24} color={theme.text} />
                </Pressable>
                <Text
                  variant="body"
                  style={{
                    fontFamily: "Archivo_600SemiBold",
                    marginLeft: Space.sm,
                  }}
                >
                  AI Advisor
                </Text>
              </View>

              <View
                style={{
                  alignSelf: "flex-start",
                  paddingHorizontal: Space.md,
                  paddingVertical: 3,
                  borderRadius: Radius.pill,
                  backgroundColor: theme.goldSoft,
                  marginBottom: Space.md,
                }}
              >
                <Text
                  variant="monoSm"
                  style={{
                    fontFamily: "JetBrainsMono_700Bold",
                    color: theme.goldDark,
                  }}
                >
                  SUSTAINABILITY REPORT
                </Text>
              </View>

              <Text variant="display" style={{ maxWidth: 300 }}>
                {context.product.name}
              </Text>
              {context.product.brand && (
                <Text
                  variant="body"
                  color={theme.textSecondary}
                  style={{ marginTop: 4 }}
                >
                  {context.product.brand}
                </Text>
              )}
            </MotiView>

            {/* ─── Loading ─── */}
            {isLoading && (
              <Section delay={200}>
                <View
                  style={{
                    alignItems: "center",
                    paddingVertical: Space["4xl"],
                    marginTop: Space.xl,
                  }}
                >
                  <MotiView
                    from={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      type: "timing",
                      duration: 900,
                      loop: true,
                      repeatReverse: true,
                    }}
                  >
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: Radius.pill,
                        backgroundColor: theme.goldSoft,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: Space.xl,
                      }}
                    >
                      <Sparkles
                        size={26}
                        color={theme.gold}
                        strokeWidth={1.5}
                      />
                    </View>
                  </MotiView>
                  <Text variant="h2">Analyzing this product&hellip;</Text>
                  <Text
                    variant="bodySm"
                    color={theme.textMuted}
                    style={{ marginTop: 6 }}
                  >
                    Generating a comprehensive report.
                  </Text>
                </View>
              </Section>
            )}

            {/* ─── Report sections ─── */}
            {!isLoading && report && (
              <>
                {/* Overall score */}
                <Section delay={80} style={{ marginTop: Space.xl }}>
                  <View
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: Radius.xl,
                      borderWidth: 1,
                      borderColor: theme.borderLight,
                      padding: Space["2xl"],
                      alignItems: "center",
                      ...Shadow.sm,
                    }}
                  >
                    <Text
                      variant="label"
                      color={theme.textMuted}
                      style={{ letterSpacing: 1.4 }}
                    >
                      OVERALL SCORE
                    </Text>
                    <MotiView
                      from={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 200,
                        type: "spring",
                        damping: 10,
                      }}
                    >
                      <Text
                        variant="display"
                        style={{
                          fontSize: 56,
                          lineHeight: 62,
                          marginTop: Space.sm,
                          color: theme.lichenDark,
                        }}
                      >
                        {context.score.total}
                      </Text>
                    </MotiView>
                    <Text variant="monoSm" color={theme.textMuted}>
                      out of 100
                    </Text>
                    <Text
                      variant="italic"
                      color={theme.textSecondary}
                      style={{
                        marginTop: Space.lg,
                        textAlign: "center",
                        maxWidth: 280,
                        lineHeight: 22,
                      }}
                    >
                      &ldquo;{report.summary}&rdquo;
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        marginTop: Space.md,
                      }}
                    >
                      <Sparkles size={11} color={theme.gold} strokeWidth={2} />
                      <Text variant="monoSm" color={theme.gold}>
                        AI Confidence: {report.confidence}
                      </Text>
                    </View>
                  </View>
                </Section>

                {/* Strengths & Weaknesses */}
                <Section delay={160} style={{ marginTop: Space.xl }}>
                  <Text variant="h2" style={{ marginBottom: Space.md }}>
                    Strengths
                  </Text>
                  {report.strengths.map((str, i) => (
                    <MotiView
                      key={i}
                      from={{ opacity: 0, translateX: -10 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{
                        delay: 220 + i * 80,
                        type: "timing",
                        duration: 300,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          paddingVertical: Space.sm,
                          gap: Space.md,
                        }}
                      >
                        <View
                          style={{
                            width: 3,
                            height: 20,
                            borderRadius: 1.5,
                            backgroundColor: theme.lichen,
                            marginTop: 2,
                          }}
                        />
                        <Text
                          variant="body"
                          style={{ flex: 1, lineHeight: 21 }}
                        >
                          {str}
                        </Text>
                      </View>
                    </MotiView>
                  ))}
                </Section>

                <Section delay={200}>
                  <Text
                    variant="h2"
                    style={{ marginTop: Space.xl, marginBottom: Space.md }}
                  >
                    Weaknesses
                  </Text>
                  {report.weaknesses.map((wk, i) => (
                    <MotiView
                      key={i}
                      from={{ opacity: 0, translateX: -10 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{
                        delay: 260 + i * 80,
                        type: "timing",
                        duration: 300,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          paddingVertical: Space.sm,
                          gap: Space.md,
                        }}
                      >
                        <View
                          style={{
                            width: 3,
                            height: 20,
                            borderRadius: 1.5,
                            backgroundColor: theme.clay,
                            marginTop: 2,
                          }}
                        />
                        <Text
                          variant="body"
                          style={{ flex: 1, lineHeight: 21 }}
                        >
                          {wk}
                        </Text>
                      </View>
                    </MotiView>
                  ))}
                </Section>

                {/* Disposal guide */}
                <Section delay={280} style={{ marginTop: Space.xl }}>
                  <View
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: Radius.xl,
                      borderWidth: 1,
                      borderColor: theme.borderLight,
                      padding: Space.xl,
                      ...Shadow.sm,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: Space.sm,
                        marginBottom: Space.lg,
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: Radius.sm,
                          backgroundColor: theme.tealSoft,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Recycle size={16} color={theme.teal} strokeWidth={2} />
                      </View>
                      <Text variant="h2">Disposal guide</Text>
                    </View>
                    {report.disposalSteps.map((step, idx) => (
                      <MotiView
                        key={idx}
                        from={{ opacity: 0, translateY: 8 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{
                          delay: 380 + idx * 80,
                          type: "timing",
                          duration: 300,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: Space.md,
                            marginBottom:
                              idx < report.disposalSteps.length - 1
                                ? Space.md
                                : 0,
                          }}
                        >
                          <StepNumber n={idx + 1} color={theme.teal} />
                          <Text
                            variant="body"
                            style={{ flex: 1, lineHeight: 21 }}
                          >
                            {step}
                          </Text>
                        </View>
                      </MotiView>
                    ))}
                  </View>
                </Section>

                {/* Environmental Impact */}
                <Section delay={360} style={{ marginTop: Space.xl }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: Space.sm,
                      marginBottom: Space.md,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: Radius.sm,
                        backgroundColor: theme.lichenMuted,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TreePine
                        size={16}
                        color={theme.lichenDark}
                        strokeWidth={2}
                      />
                    </View>
                    <Text variant="h2">Environmental impact</Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: Radius.xl,
                      borderWidth: 1,
                      borderColor: theme.borderLight,
                      paddingHorizontal: Space.lg,
                      ...Shadow.sm,
                    }}
                  >
                    <ImpactRow
                      label="Landfill risk"
                      value={report.environmentalImpact.landfillRisk}
                      index={0}
                    />
                    <ImpactRow
                      label="Recyclability"
                      value={report.environmentalImpact.recyclability}
                      index={1}
                    />
                    <ImpactRow
                      label="Carbon impact"
                      value={report.environmentalImpact.carbonImpact}
                      index={2}
                    />
                    <ImpactRow
                      label="Reuse potential"
                      value={report.environmentalImpact.reusePotential}
                      index={3}
                    />
                  </View>
                </Section>

                {/* Circular Journey */}
                <Section delay={440} style={{ marginTop: Space.xl }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: Space.sm,
                      marginBottom: Space.md,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: Radius.sm,
                        backgroundColor: theme.lichenMuted,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MapPin
                        size={16}
                        color={theme.lichenDark}
                        strokeWidth={2}
                      />
                    </View>
                    <Text variant="h2">Circular journey</Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: Radius.xl,
                      borderWidth: 1,
                      borderColor: theme.borderLight,
                      padding: Space.xl,
                      ...Shadow.sm,
                    }}
                  >
                    {report.circularJourney.map((step, idx) => (
                      <TimelineNode
                        key={idx}
                        label={step}
                        isLast={idx === report.circularJourney.length - 1}
                        index={idx}
                      />
                    ))}

                    {report.interestingFact && (
                      <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: 800,
                          type: "timing",
                          duration: 400,
                        }}
                      >
                        <View
                          style={{
                            marginTop: Space.lg,
                            padding: Space.md + 2,
                            backgroundColor: theme.lichenMuted,
                            borderRadius: Radius.md,
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: Space.sm,
                          }}
                        >
                          <Lightbulb
                            size={14}
                            color={theme.lichenDark}
                            strokeWidth={2}
                            style={{ marginTop: 2 }}
                          />
                          <Text
                            variant="bodySm"
                            color={theme.lichenDark}
                            style={{ flex: 1, lineHeight: 18 }}
                          >
                            {report.interestingFact}
                          </Text>
                        </View>
                      </MotiView>
                    )}
                  </View>
                </Section>

                {/* Recommendations */}
                <Section delay={520} style={{ marginTop: Space.xl }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: Space.sm,
                      marginBottom: Space.md,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: Radius.sm,
                        backgroundColor: theme.goldSoft,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Lightbulb size={16} color={theme.gold} strokeWidth={2} />
                    </View>
                    <Text variant="h2">Recommendations</Text>
                  </View>
                  {report.recommendations.map((rec, i) => (
                    <MotiView
                      key={i}
                      from={{ opacity: 0, translateY: 8 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{
                        delay: 600 + i * 100,
                        type: "timing",
                        duration: 300,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: theme.card,
                          borderRadius: Radius.lg,
                          borderWidth: 1,
                          borderColor: theme.borderLight,
                          padding: Space.lg,
                          marginBottom: Space.sm,
                          ...Shadow.sm,
                        }}
                      >
                        <Text
                          variant="monoSm"
                          color={theme.gold}
                          style={{
                            fontFamily: "JetBrainsMono_700Bold",
                            marginBottom: 4,
                          }}
                        >
                          {rec.title.toUpperCase()}
                        </Text>
                        <Text variant="body" style={{ lineHeight: 21 }}>
                          {rec.description}
                        </Text>
                      </View>
                    </MotiView>
                  ))}
                </Section>

                {/* Ask More — divider + scrollable pills */}
                <Section delay={600} style={{ marginTop: Space["2xl"] }}>
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.borderLight,
                      marginBottom: Space.xl,
                    }}
                  />
                  <Text variant="h2" style={{ marginBottom: Space.sm }}>
                    Ask more
                  </Text>
                  <Text
                    variant="bodySm"
                    color={theme.textMuted}
                    style={{ marginBottom: Space.md }}
                  >
                    Tap a question to get a deeper analysis.
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: Space.sm,
                    }}
                  >
                    {AI_PROMPTS.map((prompt, i) => (
                      <MotiView
                        key={prompt.id}
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 700 + i * 60,
                          type: "timing",
                          duration: 250,
                        }}
                      >
                        <Pressable
                          onPress={() => ask(prompt)}
                          disabled={!!pendingPromptId}
                          style={({ pressed }) => ({
                            paddingHorizontal: Space.lg,
                            paddingVertical: Space.md,
                            borderRadius: Radius.pill,
                            backgroundColor:
                              pendingPromptId === prompt.id
                                ? theme.goldSoft
                                : pressed
                                  ? theme.cardAlt
                                  : theme.card,
                            borderWidth: 1,
                            borderColor:
                              pendingPromptId === prompt.id
                                ? theme.gold
                                : theme.border,
                            opacity: pendingPromptId ? 0.6 : pressed ? 0.8 : 1,
                          })}
                        >
                          {pendingPromptId === prompt.id ? (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: Space.sm,
                              }}
                            >
                              <TypingIndicator />
                              <Text variant="bodySm" color={theme.goldDark}>
                                Thinking&hellip;
                              </Text>
                            </View>
                          ) : (
                            <Text variant="bodySm">{prompt.label}</Text>
                          )}
                        </Pressable>
                      </MotiView>
                    ))}
                  </View>
                </Section>

                {/* Pending typing indicator in chat area */}
                {pendingPromptId && (
                  <View
                    style={{
                      marginTop: Space.lg,
                      alignItems: "flex-start",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.card,
                        paddingHorizontal: Space.lg,
                        paddingVertical: Space.md,
                        borderRadius: Radius.lg,
                        borderBottomLeftRadius: Radius.xs,
                        borderWidth: 1,
                        borderColor: theme.borderLight,
                      }}
                    >
                      <TypingIndicator />
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        }
      />
    </View>
  );
}
