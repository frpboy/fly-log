import React, { useState } from "react";
import { Button, Group, Menu, Modal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import useFlightStore from "../store.ts";
import FlightEntryForm from "./FlightEntryForm.tsx";
import NoFlightsCard from "./NoFlightsCard.jsx";
import { downloadFlightExport } from "../utils/flightExport";

// CTA bar for creating flights or showing the empty state.
const FlightsTopBar = ({ fullWidth = false }) => {
  const allFlights = useFlightStore((s) => s.allFlights);
  const filteredFlights = useFlightStore((s) => s.filteredFlights);
  const [formOpened, setFormOpened] = useState(false);
  const { t } = useTranslation("flights");
  // Full screen on phones: the form is long and needs the whole width.
  const isMobile = useMediaQuery("(max-width: 48em)");

  // No refetch: the Firestore listener picks the new flight up from the
  // local write before the server has even acknowledged it.
  const handleFlightSaved = () => setFormOpened(false);

  return (
    <>
      <Modal
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        title={t("form.add_new_flight")}
        size="lg"
        fullScreen={isMobile}
      >
        <FlightEntryForm onSaved={handleFlightSaved} />
      </Modal>

      {/* Show NoFlightsCard when there are no flights */}
      {!Array.isArray(allFlights) || allFlights.length === 0 ? (
        <NoFlightsCard setFormOpened={setFormOpened} />
      ) : (
        <Group gap="sm" justify="space-between" wrap="wrap">
          <Button
            variant="gradient"
            onClick={() => setFormOpened(true)}
            fullWidth={fullWidth}
          >
            {t("form.add_new_flight")}
          </Button>
          <Menu withinPortal>
            <Menu.Target>
              <Button variant="default">{t("export.button")}</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{t("export.all")}</Menu.Label>
              <Menu.Item onClick={() => downloadFlightExport(allFlights, "csv", "all")}>
                {t("export.csv")}
              </Menu.Item>
              <Menu.Item onClick={() => downloadFlightExport(allFlights, "json", "all")}>
                {t("export.json")}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Label>{t("export.filtered")}</Menu.Label>
              <Menu.Item onClick={() => downloadFlightExport(filteredFlights, "csv", "filtered")}>
                {t("export.csv")}
              </Menu.Item>
              <Menu.Item onClick={() => downloadFlightExport(filteredFlights, "json", "filtered")}>
                {t("export.json")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      )}
    </>
  );
};

export default FlightsTopBar;
