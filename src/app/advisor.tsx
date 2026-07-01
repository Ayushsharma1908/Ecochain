import { router } from "expo-router";
import {
  CheckCircle2,
  Lightbulb,
  MapPin,
  Recycle,
  ScanLine,
  Sparkles,
  TreePine,
  X,
  XCircle
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { Card, EmptyState, IconBadge, IconButton, Text } from "@/components/ui";
import { Space } from "@/constants/theme";
import { useCurrentContext } from "@/context/CurrentContext";
import { useTheme } from "@/hooks/use-theme";
import { AI_PROMPTS, askAdvisor, generateAIReport } from "@/lib/aiAdvisor";
import type { AIReport, AiPrompt } from "@/types/domain";

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let current = "";
    let i = 0;

    const interval = setInterval(() => {
      if (i < text.length) {
        current += text[i];
        setDisplayedText(current);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <Text variant="bodySm" style={{ flex: 1, lineHeight: 20 }}>
      {displayedText}
    </Text>
  );
}

export default function AdvisorScreen() {
  const theme = useTheme();
  const { context } = useCurrentContext();
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exchanges, setExchanges] = useState<{ prompt: AiPrompt; answer: string }[]>([]);
  const [pendingPromptId, setPendingPromptId] = useState<string | null>(null);

  useEffect(() => {
    if (context && !report && !loading) {
      setLoading(true);
      generateAIReport(context)
        .then((res) => {
          setReport(res);
        })
        .finally(() => setLoading(false));
    }
  }, [context]);

  const ask = async (prompt: AiPrompt) => {
    if (!context || pendingPromptId !== null) return;
    setPendingPromptId(prompt.id);
    try {
      const answer = await askAdvisor(prompt.id, context, report || undefined);
      setExchanges((prev) => [...prev, { prompt, answer }]);
    } finally {
      setPendingPromptId(null);
    }
  };

  if (!context) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: Space.lg,
            paddingTop: Space.xl,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm }}>
            <IconBadge icon={Sparkles} accent={theme.gold} size={32} />
            <Text variant="h1">AI advisor</Text>
          </View>
          <IconButton icon={X} onPress={() => router.back()} />
        </View>
        <EmptyState
          illustration="scan"
          title="Scan something first"
          subtitle="The AI needs a product context to generate a Sustainability Report."
          action={{
            label: "Go scan",
            icon: ScanLine,
            onPress: () => router.replace("/(tabs)/scan"),
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: Space.lg,
          paddingTop: Space.xl,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm }}>
          <IconBadge icon={Sparkles} accent={theme.gold} size={32} />
          <Text variant="h1">Sustainability Report</Text>
        </View>
        <IconButton icon={X} onPress={() => router.back()} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: Space.lg,
          paddingTop: 0,
          paddingBottom: Space["4xl"],
          gap: Space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text variant="bodySm" color={theme.textSecondary}>
            Analyzing <Text style={{ fontFamily: "Archivo_700Bold" }}>{context.product.name}</Text>
          </Text>
        </View>

        {loading || !report ? (
          <MotiView
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 800, loop: true }}
            style={{ padding: Space.xl, alignItems: "center", gap: Space.md }}
          >
            <ActivityIndicator color={theme.gold} size="large" />
            <Text variant="bodySm" color={theme.textSecondary}>
              Generating comprehensive analysis...
            </Text>
          </MotiView>
        ) : (
          <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
            {/* Overall Score */}
            <Card
              tint={theme.canopy}
              borderAccent={theme.gold}
              style={{ padding: Space.xl, alignItems: "center", gap: Space.md }}
            >
              <Text variant="h2" color={theme.onCanopy}>Overall Insight</Text>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 4,
                  borderColor: theme.gold,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text variant="h2" color={theme.onCanopy}>{context.score.total}</Text>
                <Text variant="monoSm" color={theme.onCanopy}>/100</Text>
              </View>
              <Text variant="bodySm" color={theme.onCanopy} style={{ textAlign: "center" }}>
                "{report.summary}"
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Space.sm }}>
                <Sparkles size={14} color={theme.gold} />
                <Text variant="monoSm" color={theme.gold}>AI Confidence: {report.confidence}</Text>
              </View>
            </Card>

            <View style={{ height: Space.lg }} />

            {/* Strengths & Weaknesses */}
            <View style={{ flexDirection: "row", gap: Space.md }}>
              <Card style={{ flex: 1, gap: Space.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Space.sm }}>
                  <CheckCircle2 size={18} color={theme.teal} />
                  <Text variant="h2">Strengths</Text>
                </View>
                {report.strengths.map((str, i) => (
                  <Text key={i} variant="monoSm" style={{ flexWrap: 'wrap' }}>✓ {str}</Text>
                ))}
              </Card>
              <Card style={{ flex: 1, gap: Space.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Space.sm }}>
                  <XCircle size={18} color={theme.clay} />
                  <Text variant="h2">Weaknesses</Text>
                </View>
                {report.weaknesses.map((wk, i) => (
                  <Text key={i} variant="monoSm" style={{ flexWrap: 'wrap' }}>✗ {wk}</Text>
                ))}
              </Card>
            </View>

            <View style={{ height: Space.lg }} />

            {/* What Should I Do? */}
            <Card style={{ gap: Space.sm, padding: Space.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm, marginBottom: Space.xs }}>
                <IconBadge icon={Recycle} accent={theme.teal} size={28} />
                <Text variant="h2">AI Disposal Guide</Text>
              </View>
              {report.disposalSteps.map((step, idx) => (
                <View key={idx} style={{ flexDirection: "row", gap: Space.sm, alignItems: 'flex-start' }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: theme.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
                    <Text variant="monoSm" style={{ fontSize: 10 }} color={theme.background}>{idx + 1}</Text>
                  </View>
                  <Text variant="bodySm" style={{ flex: 1 }}>{step}</Text>
                </View>
              ))}
            </Card>

            <View style={{ height: Space.lg }} />

            {/* Environmental Impact */}
            <Card tint={theme.canopy} style={{ gap: Space.sm, padding: Space.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm, marginBottom: Space.sm }}>
                <TreePine size={20} color={theme.background} />
                <Text variant="h2" color={theme.background}>Environmental Impact</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text variant="bodySm" color={theme.background}>Landfill Risk</Text>
                <Text variant="monoSm" color={theme.background} style={{ opacity: 0.8 }}>{report.environmentalImpact.landfillRisk}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: `${theme.background}20` }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text variant="bodySm" color={theme.background}>Recyclability</Text>
                <Text variant="monoSm" color={theme.background} style={{ opacity: 0.8 }}>{report.environmentalImpact.recyclability}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: `${theme.background}20` }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text variant="bodySm" color={theme.background}>Carbon Impact</Text>
                <Text variant="monoSm" color={theme.background} style={{ opacity: 0.8 }}>{report.environmentalImpact.carbonImpact}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: `${theme.background}20` }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text variant="bodySm" color={theme.background}>Reuse Potential</Text>
                <Text variant="monoSm" color={theme.background} style={{ opacity: 0.8 }}>{report.environmentalImpact.reusePotential}</Text>
              </View>
            </Card>

            <View style={{ height: Space.lg }} />

            {/* Circular Journey */}
            <Card borderAccent={theme.lichen} style={{ gap: Space.sm, padding: Space.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm, marginBottom: Space.xs }}>
                <IconBadge icon={MapPin} accent={theme.lichen} size={28} />
                <Text variant="h2">Circular Journey</Text>
              </View>
              <View style={{ gap: Space.xs, paddingLeft: 8, borderLeftWidth: 2, borderColor: theme.border, marginLeft: 6, marginVertical: Space.sm }}>
                {report.circularJourney.map((step, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: Space.sm, marginLeft: -17 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.lichen, borderWidth: 2, borderColor: theme.background }} />
                    <Text variant="bodySm">{step}</Text>
                  </View>
                ))}
              </View>
              <View style={{ backgroundColor: theme.background, padding: Space.sm, borderRadius: 8 }}>
                <Text variant="monoSm" color={theme.textSecondary}>Fact: {report.interestingFact}</Text>
              </View>
            </Card>

            <View style={{ height: Space.lg }} />

            {/* Recommendations */}
            <Card style={{ gap: Space.md, padding: Space.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm }}>
                <IconBadge icon={Lightbulb} accent={theme.teal} size={28} />
                <Text variant="h2">Recommendations</Text>
              </View>
              {report.recommendations.map((rec, i) => (
                <View key={i} style={{ gap: 2 }}>
                  <Text variant="monoSm" color={theme.teal}>{rec.title}</Text>
                  <Text variant="bodySm">{rec.description}</Text>
                </View>
              ))}
            </Card>

            <View style={{ height: Space.xl }} />
            <View style={{ height: 1, backgroundColor: theme.border }} />
            <View style={{ height: Space.xl }} />

            {/* Ask More */}
            <Text variant="h2" style={{ marginBottom: Space.sm }}>Ask More</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm }}>
              {AI_PROMPTS.map((prompt) => (
                <Card
                  key={prompt.id}
                  onPress={() => ask(prompt)}
                  style={{ width: '48%', padding: Space.sm }}
                  borderAccent={theme[prompt.accent]}
                >
                  <Text variant="monoSm" style={{ textAlign: 'center' }}>
                    {pendingPromptId === prompt.id ? "Thinking..." : prompt.label}
                  </Text>
                </Card>
              ))}
            </View>

            <View style={{ gap: Space.md, marginTop: Space.lg }}>
              {exchanges.map((ex, i) => (
                <MotiView
                  key={i}
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                >
                  <View style={{ alignSelf: "flex-end", maxWidth: "85%", marginBottom: Space.sm }}>
                    <Card tint={theme.canopy} padded style={{ borderWidth: 0 }}>
                      <Text variant="bodySm" color={theme.onCanopy}>{ex.prompt.question}</Text>
                    </Card>
                  </View>
                  <View style={{ alignSelf: "flex-start", maxWidth: "92%" }}>
                    <Card style={{ flexDirection: "row", gap: Space.sm }}>
                      <Sparkles size={16} color={theme.gold} style={{ marginTop: 2 }} />
                      <Text
                        variant="bodySm"
                        style={{
                          flex: 1,
                          lineHeight: 22,
                        }}
                      >
                        {ex.answer}
                      </Text>
                    </Card>
                  </View>
                </MotiView>
              ))}
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}
